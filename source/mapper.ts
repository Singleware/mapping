/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import { Constructor } from './types';
import { Schema } from './schema';
import { Driver } from './driver';
import { Entity } from './entity';
import { Format } from './format';
import { Expression } from './expression';
import { Aggregate } from './aggregate';
import { Virtual } from './virtual';
import { Column } from './column';
import { Map } from './map';

/**
 * Generic data mapper class.
 */
@Class.Describe()
export class Mapper<E extends Entity> extends Class.Null {
  /**
   * List of common types.
   */
  @Class.Private()
  private static commons = [Object, String, Number, Boolean, Date];

  /**
   * Data driver.
   */
  @Class.Private()
  private driver: Driver;

  /**
   * Entity model.
   */
  @Class.Private()
  private model: Constructor<E>;

  /**
   * Gets the primary column name.
   * @returns Returns the primary column name.
   * @throws Throws an error when there is no primary column defined.
   */
  @Class.Private()
  private getPrimaryName(): string {
    const column = <Column>Schema.getPrimary(this.model);
    if (!column) {
      throw new Error(`There is no primary column to be used.`);
    }
    return Mapper.getColumnName(column);
  }

  /**
   * Gets the virtual columns list.
   * @returns Returns the virtual columns list.
   */
  @Class.Private()
  private getAggregations(): Aggregate[] {
    const columns = Schema.getVirtual(this.model);
    const list = [];
    if (columns) {
      for (const name in columns) {
        const virtual = columns[name];
        const localColumn = <Column>Schema.getColumn(this.model, virtual.local);
        const foreignColumn = <Column>Schema.getColumn(virtual.model, virtual.foreign);
        list.push({
          local: Mapper.getColumnName(localColumn),
          foreign: Mapper.getColumnName(foreignColumn),
          virtual: virtual.name,
          storage: <string>Schema.getStorage(virtual.model),
          multiple: localColumn.types.includes(Format.ARRAY)
        });
      }
    }
    return list;
  }

  /**
   * Assign virtual columns into the specified data based on the given entity.
   * @param data Target entity data.
   * @param entity Source entity.
   * @returns Returns the specified entity data.
   */
  @Class.Private()
  private assignVirtual(data: E, entity: Entity): E {
    const virtual = <Map<Virtual>>Schema.getVirtual(this.model);
    for (const name in virtual) {
      if (name in entity) {
        data[name] = entity[name];
      }
    }
    return data;
  }

  /**
   * Creates a new model data based on the specified entity data.
   * @param entity Entity data.
   * @param input Determines whether the entity will be used for an input or output.
   * @param all Determines if all required properties must be provided.
   * @returns Returns the new generated entity data based on entity model.
   * @throws Throws an error when a required column is not supplied.
   */
  @Class.Private()
  private createModel(entity: Entity, input: boolean, all: boolean): E {
    return <E>Mapper.createModel(this.model, entity, input, all);
  }

  /**
   * Generate a new normalized entity based on the specified entity data.
   * @param entity Entity data.
   * @returns Returns the new normalized entity data.
   */
  @Class.Protected()
  protected normalize(entity: Entity): Entity {
    return Mapper.normalize(this.model, entity);
  }

  /**
   * Normalize all entities in the specified entity list.
   * @param entities Entities list.
   * @returns Returns the list of normalized entities.
   */
  @Class.Protected()
  protected normalizeAll(...entities: Entity[]): Entity[] {
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
  protected async insertMany(entities: E[]): Promise<any[]> {
    const list = [];
    for (const entity of entities) {
      list.push(this.createModel(entity, true, true));
    }
    return await this.driver.insert(this.model, ...list);
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
   * @param filter Filter expression.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Protected()
  protected async find(filter: Expression): Promise<E[]> {
    const entities = await this.driver.find(this.model, filter, this.getAggregations());
    const results = [];
    for (const entity of entities) {
      results.push(this.assignVirtual(this.createModel(entity, false, true), entity));
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
    const entity = await this.driver.findById(this.model, id, this.getAggregations());
    return entity ? this.assignVirtual(this.createModel(entity, false, true), entity) : void 0;
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param filter Filter expression.
   * @param entity Entity data to be updated.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Protected()
  protected async update(filter: Expression, entity: Entity): Promise<number> {
    return await this.driver.update(this.model, filter, this.createModel(entity, true, false));
  }

  /**
   * Update a entity that corresponds to the specified id.
   * @param id Entity id.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateById(id: any, entity: Entity): Promise<boolean> {
    return await this.driver.updateById(this.model, id, this.createModel(entity, true, false));
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param filter Filter columns.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Protected()
  protected async delete(filter: Expression): Promise<number> {
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
  public constructor(driver: Driver, model: Constructor<E>) {
    super();
    if (!Schema.getStorage(model)) {
      throw new Error(`There is no storage name, make sure your entity model is a valid.`);
    }
    this.driver = driver;
    this.model = model;
  }

  /**
   * Determines whether the specified entity type common or not.
   * @param type Entity type.
   * @returns Returns true when the specified entity is common, false otherwise.
   */
  @Class.Private()
  private static isCommon(type: any): boolean {
    return this.commons.indexOf(type) !== -1;
  }

  /**
   * Gets the column name from the specified column schema.
   * @param column Column schema.
   * @returns Returns the column name.
   */
  @Class.Private()
  private static getColumnName(column: Column): string {
    return column.alias || column.name;
  }

  /**
   * Creates a new array of model data based on the specified entity model and values.
   * @param model Entity model.
   * @param values Entities list.
   * @param input Determines whether the entity will be used for an input or output.
   * @param all Determines if all required properties must be provided.
   * @returns Returns the new generated list of entities based on entity model.
   */
  @Class.Private()
  private static createArrayModel(model: Constructor<Entity>, values: Entity[], input: boolean, all: boolean): Entity {
    const list = [];
    for (const value of values) {
      list.push(this.createModel(model, value, input, all));
    }
    return list;
  }

  /**
   * Creates a new map of model data based on the specified entity model and value.
   * @param model Entity model.
   * @param value Entity map.
   * @param input Determines whether the entity will be used for an input or output.
   * @param all Determines if all required properties must be provided.
   * @returns Returns the new generated map of entity data based on entity model.
   */
  @Class.Private()
  private static createMapModel(model: Constructor<Entity>, value: Entity, input: boolean, all: boolean): Entity {
    const map = <Entity>{};
    for (const name in value) {
      map[name] = this.createModel(model, value[name], input, all);
    }
    return map;
  }

  /**
   * Creates a new model value based on the specified entity model and data.
   * @param column Column schema.
   * @param value Value to be created.
   * @param input Determines whether the entity will be used for an input or output.
   * @param all Determines if all required properties must be provided.
   * @returns Returns the new normalized value.
   */
  @Class.Private()
  private static createValueModel(column: Column, value: any, input: boolean, all: boolean): any {
    if (column.model && !this.isCommon(column.model)) {
      if (column.types.indexOf(Format.ARRAY) !== -1) {
        return this.createArrayModel(column.model, value, input, all);
      } else if (column.types.indexOf(Format.MAP) !== -1) {
        return this.createMapModel(column.model, value, input, all);
      } else {
        return this.createModel(column.model, value, input, all);
      }
    }
    return value;
  }

  /**
   * Creates a new model data based on the specified entity model and data.
   * @param model Entity model.
   * @param data Entity data.
   * @param input Determines whether the entity will be used for an input or output.
   * @param all Determines if all required properties must be provided.
   * @returns Returns the new generated entity data based on entity model.
   * @throws Throws an error when a required column is not supplied.
   */
  @Class.Private()
  private static createModel(model: Constructor<Entity>, entity: Entity, input: boolean, all: boolean): Entity {
    const data = new model();
    const columns = <Map<Column>>Schema.getRow(model);
    for (const name in columns) {
      const column = columns[name];
      const source = input ? name : this.getColumnName(column);
      const target = input ? this.getColumnName(column) : name;
      if (source in entity && entity[source] !== void 0) {
        data[target] = this.createValueModel(column, entity[source], input, all);
      } else if (all && column.required) {
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
  private static normalizeArray(model: Constructor<Entity>, values: Entity[]): Entity {
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
  private static normalizeMap(model: Constructor<Entity>, value: Entity): Entity {
    const map = <Entity>{};
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
  private static normalizeValue(column: Column, value: any): any {
    if (column.model && !this.isCommon(column.model)) {
      if (column.types.indexOf(Format.ARRAY) !== -1) {
        return this.normalizeArray(column.model, value);
      } else if (column.types.indexOf(Format.MAP) !== -1) {
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
  protected static normalize(model: Constructor<Entity>, entity: Entity): Entity {
    const columns = <Map<Column>>Schema.getRow(model);
    const virtual = <Map<Virtual>>Schema.getVirtual(model);
    const data = <Entity>{};
    for (const name in entity) {
      const value = entity[name];
      if (value !== void 0) {
        if (name in columns) {
          const schema = columns[name];
          if (!schema.hidden) {
            data[name] = this.normalizeValue(schema, value);
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
}
