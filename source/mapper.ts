/**
 * Copyright (C) 2018 Silas B. Domingos
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
   * Data driver.
   */
  @Class.Private()
  private driver: Driver;

  /**
   * Entity model.
   */
  @Class.Private()
  private model: Types.Model<E>;

  /**
   * List of common types.
   */
  @Class.Private()
  private static commons = <any[]>[Object, String, Number, Boolean, Date];

  /**
   * Creates and get a new array of data model based on the specified entity model and values.
   * @param model Entity model.
   * @param values Entities list.
   * @param input Determines whether the entity will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new generated list of entities based on entity model.
   */
  @Class.Private()
  private static getArrayModel(model: Types.Model, values: Types.Entity[], input: boolean, fully: boolean): Types.Entity[] {
    const list = <Types.Entity[]>[];
    for (const value of values) {
      list.push(this.createModel(model, value, input, fully));
    }
    return list;
  }

  /**
   * Creates and get a new map of data model based on the specified entity model and value.
   * @param model Entity model.
   * @param value Entity map.
   * @param input Determines whether the entity will be used for an input or output.
   * @param fully Determines if all required properties must be provided.
   * @returns Returns the new generated map of entity data based on entity model.
   */
  @Class.Private()
  private static getMapModel(model: Types.Model, value: Types.Entity, input: boolean, fully: boolean): Types.Entity {
    const map = <Types.Entity>{};
    for (const name in value) {
      map[name] = this.createModel(model, value[name], input, fully);
    }
    return map;
  }

  /**
   * Creates and get a new model value based on the specified entity model and data.
   * @param column Column schema.
   * @param value Value to be created.
   * @param input Determines whether the entity will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new normalized value.
   */
  @Class.Private()
  private static getValueModel(column: Columns.Real, value: any, input: boolean, fully: boolean): any {
    if (column.model && !this.commons.includes(column.model)) {
      if (column.formats.includes(Types.Format.ARRAY)) {
        return this.getArrayModel(column.model, value, input, fully);
      } else if (column.formats.includes(Types.Format.MAP)) {
        return this.getMapModel(column.model, value, input, fully);
      } else {
        return this.createModel(column.model, value, input, fully);
      }
    }
    return value;
  }

  /**
   * Creates a new data model based on the specified entity model and data.
   * @param model Entity model.
   * @param data Entity data.
   * @param input Determines whether the entity will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new generated entity data based on entity model.
   * @throws Throws an error when a required column is not supplied or some read-only/write-only property was set wrongly.
   */
  @Class.Private()
  private static createModel(model: Types.Model, entity: Types.Entity, input: boolean, fully: boolean): Types.Entity {
    const data = new model();
    const columns = <Columns.RealRow>Schema.getRealRow(model);
    for (const name in columns) {
      const column = columns[name];
      const source = input ? column.name : column.alias || column.name;
      const target = input ? column.alias || column.name : column.name;
      if (source in entity && entity[source] !== void 0) {
        if (input && column.readonly) {
          throw new Error(`The specified property ${target} is read-only.`);
        } else if (!input && column.writeonly) {
          throw new Error(`The specified property ${target} is write-only.`);
        } else {
          data[target] = this.getValueModel(column, entity[source], input, fully);
        }
      } else if (fully && column.required) {
        throw new Error(`Required column '${name}' for entity '${Schema.getStorage(model)}' does not supplied.`);
      }
    }
    return data;
  }

  /**
   * Generates a new normalized array of entity data based on the specified entity model and values.
   * @param model Entity model.
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
   * Generates a new normalized map of entity data based on the specified entity model and value.
   * @param model Entity model.
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
   * Generates a new normalized value from the specified column schema and value.
   * @param column Column schema.
   * @param value Value to be normalized.
   * @returns Returns the new normalized value.
   */
  @Class.Private()
  private static normalizeValue(column: Columns.Real, value: any): any {
    if (column.model && !this.commons.includes(column.model)) {
      if (column.formats.includes(Types.Format.ARRAY)) {
        return this.normalizeArray(column.model, value);
      } else if (column.formats.includes(Types.Format.MAP)) {
        return this.normalizeMap(column.model, value);
      } else {
        return this.normalize(column.model, value);
      }
    }
    return value;
  }

  /**
   * Generates a new normalized entity data based on the specified entity model and data.
   * @param model Entity model
   * @param entity Entity data.
   * @returns Returns the new normalized entity data.
   */
  @Class.Protected()
  protected static normalize(model: Types.Model, entity: Types.Entity): Types.Entity {
    const rColumns = <Columns.RealRow>Schema.getRealRow(model);
    const vColumns = <Columns.VirtualRow>Schema.getVirtualRow(model);
    const data = <Types.Entity>{};
    for (const name in entity) {
      const value = entity[name];
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
   * Assign all joined columns into the specified data model from the given entity.
   * @param data Target entity data.
   * @param entity Source entity.
   * @returns Returns the specified entity data.
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
   * Creates a new data model based on the specified entity data.
   * @param entity Entity data.
   * @param input Determines whether the entity will be used for an input or output.
   * @param fully Determines whether all required properties must be provided.
   * @returns Returns the new generated entity data based on entity model.
   * @throws Throws an error when a required column is not supplied.
   */
  @Class.Private()
  private createModel(entity: Types.Entity, input: boolean, fully: boolean): E {
    return <E>Mapper.createModel(this.model, entity, input, fully);
  }

  /**
   * Generate a new normalized entity based on the specified entity data.
   * @param entity Entity data.
   * @returns Returns the new normalized entity data.
   */
  @Class.Protected()
  protected normalize(entity: Types.Entity): Types.Entity {
    return Mapper.normalize(this.model, entity);
  }

  /**
   * Normalize all entities in the specified entity list.
   * @param entities Entities list.
   * @returns Returns the list of normalized entities.
   */
  @Class.Protected()
  protected normalizeAll(...entities: Types.Entity[]): Types.Entity[] {
    const list = [];
    for (const entity of entities) {
      list.push(this.normalize(entity));
    }
    return list;
  }

  /**
   * Insert the specified entity list into the storage.
   * @param entities Entity list.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Protected()
  protected async insertMany(...entities: E[]): Promise<any[]> {
    const list = [];
    for (const entity of entities) {
      list.push(this.createModel(entity, true, true));
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
    return (await this.insertMany(entity))[0];
  }

  /**
   * Find the corresponding entity in the storage.
   * @param filters List of expression filters.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Protected()
  protected async find(...filters: Statements.Filter[]): Promise<E[]> {
    const entities = await this.driver.find(this.model, this.getJoinedColumns(), filters);
    const results = [];
    for (const entity of entities) {
      results.push(this.assignJoinedColumns(this.createModel(entity, false, true), entity));
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
      return this.assignJoinedColumns(this.createModel(entity, false, true), entity);
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
    return await this.driver.update(this.model, this.createModel(entity, true, false), filter);
  }

  /**
   * Update a entity that corresponds to the specified id.
   * @param id Entity id.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateById(id: any, entity: Types.Entity): Promise<boolean> {
    return await this.driver.updateById(this.model, this.createModel(entity, true, false), id);
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
