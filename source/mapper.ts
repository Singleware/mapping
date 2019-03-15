/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Columns from './columns';
import * as Statements from './statements';

import { Schema } from './schema';
import { Driver } from './driver';

/**
 * Generic data mapper class.
 */
@Class.Describe()
export class Mapper<E extends Types.Entity> extends Class.Null {
  /**
   * Entity model.
   */
  @Class.Private()
  private model: Types.Model<E>;

  /**
   * Data driver.
   */
  @Class.Private()
  private driver: Driver;

  /**
   * Creates a new entity based on the specified model type and input data.
   * @param model Model type.
   * @param data Input data.
   * @param input Determines whether data will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new generated entity based on the model type.
   * @throws Throws an error when some required column was not supplied or some read-only/write-only property was set wrongly.
   */
  @Class.Private()
  private static createEntity(model: Types.Model, data: Types.Entity, input: boolean, fully: boolean): Types.Entity {
    const entity = new model();
    const storage = Schema.getStorage(model);
    const columns = <Columns.RealRow>Schema.getRealRow(model);
    for (const column in columns) {
      const schema = columns[column];
      const source = input ? schema.name : schema.alias || schema.name;
      const target = input ? schema.alias || schema.name : schema.name;
      if (source in data && data[source] !== void 0) {
        if (input && schema.readOnly) {
          throw new Error(`Column '${column}' in the entity '${storage}' is read-only.`);
        } else if (!input && schema.writeOnly) {
          throw new Error(`Column '${column}' in the entity '${storage}' is write-only.`);
        } else {
          const value = schema.converter ? schema.converter(data[source]) : data[source];
          entity[target] = this.castValue(schema, value, input, fully);
        }
      } else if (fully && schema.required && ((!input && !schema.writeOnly) || (input && !schema.readOnly))) {
        throw new Error(`Column '${column}' in the entity '${storage}' is required.`);
      }
    }
    return entity;
  }

  /**
   * Creates a new list of entities based on the specified model type and the list of data.
   * @param model Model type.
   * @param list List of data.
   * @param input Determines whether the data will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new generated list of entities based on the model type.
   */
  @Class.Private()
  private static createEntityArray(model: Types.Model, list: Types.Entity[], input: boolean, fully: boolean): Types.Entity[] {
    const entities = <Types.Entity[]>[];
    for (const data of list) {
      entities.push(this.createEntity(model, data, input, fully));
    }
    return entities;
  }

  /**
   * Create a new map of entities based on the specified model type and map of data.
   * @param model Model type.
   * @param map Map of data.
   * @param input Determines whether the data will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new generated map of entities based on the model type.
   */
  @Class.Private()
  private static createEntityMap(model: Types.Model, map: Types.Entity, input: boolean, fully: boolean): Types.Entity {
    const entities = <Types.Entity>{};
    for (const name in map) {
      entities[name] = this.createEntity(model, map[name], input, fully);
    }
    return entities;
  }

  /**
   * Check whether the specified value can be converted to an entity.
   * @param real Real column schema.
   * @param value Value to be converted.
   * @param input Determines whether the value will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the original or the converted value.
   */
  @Class.Private()
  private static castValue(real: Columns.Real, value: any, input: boolean, fully: boolean): any {
    if (real.model && Schema.isEntity(real.model)) {
      if (real.formats.includes(Types.Format.ARRAY)) {
        return this.createEntityArray(real.model, value, input, fully);
      } else if (real.formats.includes(Types.Format.MAP)) {
        return this.createEntityMap(real.model, value, input, fully);
      } else {
        return this.createEntity(real.model, value, input, fully);
      }
    }
    return value;
  }

  /**
   * Generates a new normalized array of entities data based on the specified model type and input values.
   * @param model Model type.
   * @param values Entities list.
   * @returns Returns the new normalized list of entities.
   */
  @Class.Private()
  private static normalizeArray(model: Types.Model, values: Types.Entity[]): Types.Entity {
    const list = [];
    for (const value of values) {
      list.push(this.normalize(model, value));
    }
    return list;
  }

  /**
   * Generates a new normalized map of entities data based on the specified model type and value.
   * @param model Model type.
   * @param value Entity map.
   * @returns Returns the new normalized map of entities.
   */
  @Class.Private()
  private static normalizeMap(model: Types.Model, value: Types.Entity): Types.Entity {
    const map = <Types.Entity>{};
    for (const name in value) {
      map[name] = this.normalize(model, value[name]);
    }
    return map;
  }

  /**
   * Generates a new normalized value from the specified real column schema and value.
   * @param real Real column schema.
   * @param value Value to be normalized.
   * @returns Returns the new normalized value.
   */
  @Class.Private()
  private static normalizeValue(real: Columns.Real, value: any): any {
    if (real.model && Schema.isEntity(real.model)) {
      if (real.formats.includes(Types.Format.ARRAY)) {
        return this.normalizeArray(real.model, value);
      } else if (real.formats.includes(Types.Format.MAP)) {
        return this.normalizeMap(real.model, value);
      } else {
        return this.normalize(real.model, value);
      }
    }
    return value;
  }

  /**
   * Generates a new normalized entity data based on the specified model type and input data.
   * @param model Model type.
   * @param input Input data.
   * @returns Returns the new normalized entity data.
   */
  @Class.Public()
  public static normalize(model: Types.Model, input: Types.Entity): Types.Entity {
    const rColumns = <Columns.RealRow>Schema.getRealRow(model);
    const vColumns = <Columns.VirtualRow>Schema.getVirtualRow(model);
    const data = <Types.Entity>{};
    for (const name in input) {
      const value = input[name];
      if (value !== void 0) {
        if (name in rColumns) {
          if (!rColumns[name].hidden) {
            data[name] = this.normalizeValue(rColumns[name], value);
          }
        } else if (name in vColumns) {
          if (value instanceof Array) {
            data[name] = this.normalizeArray(vColumns[name].model || model, value);
          } else {
            data[name] = this.normalize(vColumns[name].model || model, value);
          }
        }
      }
    }
    return data;
  }

  /**
   * Gets the list of joined columns.
   * @returns Returns the virtual columns list.
   */
  @Class.Private()
  private getJoinedColumns(): Statements.Join[] {
    const columns = Schema.getVirtualRow(this.model);
    const list = <Statements.Join[]>[];
    if (columns) {
      for (const name in columns) {
        const column = columns[name];
        const local = <Columns.Real>Schema.getRealColumn(this.model, column.local);
        const foreign = <Columns.Real>Schema.getRealColumn(column.model, column.foreign);
        list.push({
          local: local.alias || local.name,
          foreign: foreign.alias || foreign.name,
          virtual: column.name,
          storage: <string>Schema.getStorage(column.model),
          multiple: local.formats.includes(Types.Format.ARRAY)
        });
      }
    }
    return list;
  }

  /**
   * Creates a new entity based on the current model type and input data.
   * @param data Input data.
   * @param input Determines whether the data will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new generated entity.
   */
  @Class.Private()
  private createEntity(data: Types.Entity, input: boolean, fully: boolean): E {
    return <E>Mapper.createEntity(this.model, data, input, fully);
  }

  /**
   * Assign all joined columns into the specified data the given entity.
   * @param data Target data.
   * @param entity Source entity.
   * @returns Returns the specified target data.
   */
  @Class.Private()
  private assignJoinedColumns(data: E, entity: Types.Entity): E {
    const columns = <Columns.VirtualRow>Schema.getVirtualRow(this.model);
    for (const name in columns) {
      if (name in entity) {
        data[name] = entity[name];
      }
    }
    return data;
  }

  /**
   * Generate a new normalized entity based on the specified input data.
   * @param input Input data.
   * @returns Returns the new normalized entity data.
   */
  @Class.Protected()
  protected normalize(input: Types.Entity): Types.Entity {
    return Mapper.normalize(this.model, input);
  }

  /**
   * Normalize all entities in the specified input list.
   * @param list Input list.
   * @returns Returns the list of normalized entities.
   */
  @Class.Protected()
  protected normalizeAll(...list: Types.Entity[]): Types.Entity[] {
    const entities = [];
    for (const input of list) {
      entities.push(this.normalize(input));
    }
    return entities;
  }

  /**
   * Normalize all entities in the specified input list to a map of entities.
   * @param list Input list.
   * @returns Returns the map of normalized entities.
   */
  @Class.Protected()
  protected normalizeAsMap(...list: Types.Entity[]): Types.Entity {
    const column = Schema.getRealPrimaryColumn(this.model);
    const map = <Types.Entity>{};
    if (!column) {
      throw new Error(`The specified data model has no primary column.`);
    }
    for (const input of list) {
      const normalized = this.normalize(input);
      map[normalized[column.alias || column.name]] = normalized;
    }
    return map;
  }

  /**
   * Insert the specified entity list into the storage.
   * @param entities Entity list.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Protected()
  protected async insertMany(entities: E[]): Promise<any[]> {
    const list = [];
    for (const entity of entities) {
      list.push(this.createEntity(entity, true, true));
    }
    return await this.driver.insert(this.model, list);
  }

  /**
   * Insert the specified entity into the storage.
   * @param entity Entity data.
   * @returns Returns a promise to get the id of inserted entry.
   */
  @Class.Protected()
  protected async insert(entity: E): Promise<any> {
    return (await this.insertMany([entity]))[0];
  }

  /**
   * Find the corresponding entity in the storage.
   * @param filter Field filters.
   * @param sort Sorting fields.
   * @param limit Result limits.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Protected()
  protected async find(filter: Statements.Filter, sort?: Statements.Sort, limit?: Statements.Limit): Promise<E[]> {
    const list = await this.driver.find(this.model, this.getJoinedColumns(), filter, sort, limit);
    const results = [];
    for (const entity of list) {
      results.push(this.assignJoinedColumns(this.createEntity(entity, false, true), entity));
    }
    return results;
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param id Entity id.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  @Class.Protected()
  protected async findById(id: any): Promise<E | undefined> {
    const entity = await this.driver.findById(this.model, this.getJoinedColumns(), id);
    if (entity) {
      return this.assignJoinedColumns(this.createEntity(entity, false, true), entity);
    }
    return void 0;
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param filter Filter expression.
   * @param entity Entity data to be updated.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Protected()
  protected async update(filter: Statements.Filter, entity: Types.Entity): Promise<number> {
    return await this.driver.update(this.model, this.createEntity(entity, true, false), filter);
  }

  /**
   * Update a entity that corresponds to the specified id.
   * @param id Entity id.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateById(id: any, entity: Types.Entity): Promise<boolean> {
    return await this.driver.updateById(this.model, this.createEntity(entity, true, false), id);
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param filter Filter columns.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Protected()
  protected async delete(filter: Statements.Filter): Promise<number> {
    return await this.driver.delete(this.model, filter);
  }

  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Protected()
  protected async deleteById(id: any): Promise<boolean> {
    return await this.driver.deleteById(this.model, id);
  }

  /**
   * Default constructor.
   * @param driver Data driver.
   * @param model Entity model.
   * @throws Throws an error when the model is a not valid entity.
   */
  public constructor(driver: Driver, model: Types.Model<E>) {
    super();
    this.driver = driver;
    if (!Schema.getStorage((this.model = model))) {
      throw new Error(`There is no storage name, make sure your entity model is valid.`);
    }
  }
}
