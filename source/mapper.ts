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
   * Creates a new input entity based on the specified model type, view modes and the input data.
   * @param model Model type.
   * @param views View modes.
   * @param data Input data.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the generated entity.
   * @throws Throws an error when some required column was not supplied or some read-only property was set.
   */
  @Class.Private()
  private static createInputEntity(model: Types.Model, views: string[], data: Types.Entity, full: boolean): Types.Entity {
    const entity = new model();
    const rows = Schema.getRealRow(model, ...views);
    for (const name in rows) {
      const schema = rows[name];
      const source = schema.name;
      const target = (<Columns.Real>schema).alias || schema.name;
      if (source in data && data[source] !== void 0) {
        if (schema.readOnly) {
          throw new Error(`Column '${name}' in the entity '${Schema.getStorage(model)}' is read-only.`);
        } else {
          const converted = schema.converter ? schema.converter(data[source]) : data[source];
          const casted = this.castValue(model, views, schema, converted, true, full);
          if (casted !== void 0) {
            entity[target] = casted;
          }
        }
      } else if (full && schema.required && !schema.readOnly) {
        throw new Error(`Required column '${name}' in the entity '${Schema.getStorage(model)}' was not given.`);
      }
    }
    return entity;
  }

  /**
   * Creates a new output entity based on the specified model type, view modes and the output data.
   * @param model Model type.
   * @param views View modes.
   * @param data Output data.
   * @param full Determines whether all required properties must be provided.
   * @param wanted Determines whether all properties are wanted by the upper entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when some required column was not supplied or some write-only property was set.
   */
  @Class.Private()
  private static createOutputEntity(model: Types.Model, views: string[], data: Types.Entity, full: boolean, wanted: boolean): Types.Entity | undefined {
    const required = [];
    const entity = new model();
    const rows = { ...Schema.getRealRow(model, ...views), ...Schema.getVirtualRow(model, ...views) };
    let empty = true;
    for (const name in rows) {
      const schema = rows[name];
      const source = (<Columns.Real>schema).alias || schema.name;
      const target = schema.name;
      if (source in data && data[source] !== void 0) {
        if (schema.writeOnly) {
          throw new Error(`Column '${name}' in the entity '${Schema.getStorage(model)}' is write-only.`);
        } else {
          const converted = schema.converter ? schema.converter(data[source]) : data[source];
          const casted = this.castValue(model, views, schema, converted, false, full);
          if (casted !== void 0 && casted !== null && (wanted || !empty || !this.isEmpty(casted))) {
            entity[target] = casted;
            empty = false;
          }
        }
      } else if (full && schema.required && !schema.writeOnly) {
        required.push(name);
      }
    }
    if (empty) {
      return void 0;
    } else if (required.length) {
      throw new Error(`Required column(s) '${required.join(',')}' in the entity '${Schema.getStorage(model)}' was not given.`);
    }
    return entity;
  }

  /**
   * Creates a new list of entities based on the specified model type, view modes and the list of data.
   * @param model Model type.
   * @param views View modes.
   * @param list List of data.
   * @param input Determines whether the data will be used for an input or output.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the new generated list of entities.
   */
  @Class.Private()
  private static createEntityArray(model: Types.Model, views: string[], list: Types.Entity[], input: boolean, full: boolean): Types.Entity[] {
    const entities = <Types.Entity[]>[];
    for (const data of list) {
      const entity = input ? this.createInputEntity(model, views, data, full) : this.createOutputEntity(model, views, data, full, false);
      if (entity !== void 0) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /**
   * Create a new map of entities based on the specified model type, view modes and the map of data.
   * @param model Model type.
   * @param views View modes.
   * @param map Map of data.
   * @param input Determines whether the data will be used for an input or output.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the generated map of entities.
   */
  @Class.Private()
  private static createEntityMap(model: Types.Model, views: string[], map: Types.Entity, input: boolean, full: boolean): Types.Entity {
    const entities = <Types.Entity>{};
    for (const name in map) {
      const entity = input ? this.createInputEntity(model, views, map[name], full) : this.createOutputEntity(model, views, map[name], full, false);
      if (entity !== void 0) {
        entities[name] = entity;
      }
    }
    return entities;
  }

  /**
   * Converts the specified value into an entity when possible.
   * @param model Model type.
   * @param views View modes.
   * @param schema Column schema.
   * @param value Value to be converted.
   * @param input Determines whether the value will be used for an input or output.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the original or the converted value.
   */
  @Class.Private()
  private static castValue(model: Types.Model, views: string[], schema: Columns.Base, value: any, input: boolean, full: boolean): any {
    if (schema.model && Schema.isEntity(schema.model)) {
      const formats = (<Columns.Real>(schema.type !== 'real' ? Schema.getRealColumn(model, (<Columns.Virtual>schema).local) : schema)).formats;
      if (formats.includes(Types.Format.ARRAY)) {
        return this.createEntityArray(schema.model, views, value, input, full);
      } else if (formats.includes(Types.Format.MAP)) {
        return this.createEntityMap(schema.model, views, value, input, full);
      } else if (input) {
        return this.createInputEntity(schema.model, views, value, full);
      } else {
        return this.createOutputEntity(schema.model, views, value, full, <boolean>schema.required && schema.type === 'real');
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
    const real = Schema.getRealRow(model, Types.View.ALL);
    const virtual = Schema.getVirtualRow(model, Types.View.ALL);
    const data = <Types.Entity>{};
    for (const name in input) {
      const value = input[name];
      if (value !== void 0) {
        if (name in real) {
          if (!real[name].hidden) {
            data[name] = this.normalizeValue(real[name], value);
          }
        } else if (name in virtual) {
          if (value instanceof Array) {
            data[name] = this.normalizeArray(virtual[name].model || model, value);
          } else {
            data[name] = this.normalize(virtual[name].model || model, value);
          }
        }
      }
    }
    return data;
  }

  /**
   * Determines whether the specified value is empty or not.
   * @param value Value to be checked.
   * @returns Returns true when the specified value is empty or false otherwise.
   */
  @Class.Public()
  public static isEmpty(value: any): boolean {
    if (value instanceof Array) {
      return value.length === 0;
    } else if (value instanceof Object) {
      return !Schema.isEntity(value) && Object.keys(value).length === 0;
    } else {
      return value === void 0 || value === null;
    }
  }

  /**
   * Creates a new entity based on the current model type, view mode and input data.
   * @param data Input data.
   * @param views View modes.
   * @param input Determines whether the data will be used for an input or output.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the new generated entity or undefined when the entity is empty.
   */
  @Class.Private()
  private createEntity(data: Types.Entity, views: string[], input: boolean, full: boolean): E | undefined {
    if (input) {
      return <E | undefined>Mapper.createInputEntity(this.model, views, data, full);
    } else {
      return <E | undefined>Mapper.createOutputEntity(this.model, views, data, true, full);
    }
  }

  /**
   * Creates a new list of entities based on the specified model type, view mode and data list.
   * @param list Data list.
   * @param views View modes.
   * @param input Determines whether the data will be used for an input or output.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the new generated list of entities or undefined when the list is empty.
   */
  @Class.Private()
  private createEntityArray(list: Types.Entity[], views: string[], input: boolean, full: boolean): E[] {
    return <E[]>Mapper.createEntityArray(this.model, views, list, input, full);
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
    return list.map((entity: Types.Entity) => this.normalize(entity));
  }

  /**
   * Normalize all entities in the specified input list to a map of entities.
   * @param list Input list.
   * @returns Returns the map of normalized entities.
   */
  @Class.Protected()
  protected normalizeAsMap(...list: Types.Entity[]): Types.Entity {
    const column = Schema.getPrimaryColumn(this.model);
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
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Protected()
  protected async insertMany(entities: E[], views: string[] = [Types.View.ALL]): Promise<any[]> {
    return await this.driver.insert(this.model, views, this.createEntityArray(entities, views, true, true));
  }

  /**
   * Insert the specified entity into the storage.
   * @param entity Entity data.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the id of inserted entry.
   */
  @Class.Protected()
  protected async insert(entity: E, views: string[] = [Types.View.ALL]): Promise<any> {
    return (await this.insertMany([entity], views))[0];
  }

  /**
   * Find all corresponding entity in the storage.
   * @param filter Field filter.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Protected()
  protected async find(filter: Statements.Filter, views: string[] = [Types.View.ALL]): Promise<E[]> {
    return this.createEntityArray(await this.driver.find(this.model, views, filter), views, false, true);
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param id Entity id.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  @Class.Protected()
  protected async findById(id: any, views: string[] = [Types.View.ALL]): Promise<E | undefined> {
    const data = await this.driver.findById(this.model, views, id);
    return data ? this.createEntity(data, views, false, true) : void 0;
  }

  /**
   * Update all entities that corresponds to the specified match.
   * @param match Matching fields.
   * @param entity Entity data to be updated.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Protected()
  protected async update(match: Statements.Match, entity: Types.Entity, views: string[] = [Types.View.ALL]): Promise<number> {
    const data = this.createEntity(entity, views, true, false);
    return data ? await this.driver.update(this.model, views, match, data) : 0;
  }

  /**
   * Update a entity that corresponds to the specified id.
   * @param id Entity id.
   * @param entity Entity data to be updated.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateById(id: any, entity: Types.Entity, views: string[] = [Types.View.ALL]): Promise<boolean> {
    const data = this.createEntity(entity, views, true, false);
    return data ? await this.driver.updateById(this.model, views, id, data) : false;
  }

  /**
   * Delete all entities that corresponds to the specified match.
   * @param match Matching fields.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Protected()
  protected async delete(match: Statements.Match): Promise<number> {
    return await this.driver.delete(this.model, match);
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
    this.model = model;
    if (!Schema.isEntity(model)) {
      throw new Error(`The specified model isn't a valid entity model.`);
    }
  }
}
