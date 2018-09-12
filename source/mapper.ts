/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import { Constructor } from './types';
import { Schema } from './schema';
import { Driver } from './driver';
import { Entity } from './entity';
import { Expression } from './expression';
import { Aggregate } from './aggregate';
import { Virtual } from './virtual';
import { Column } from './column';
import { Map } from './map';

/**
 * Generic data mapper class.
 */
@Class.Describe()
export class Mapper<E extends Entity> {
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
   * Gets the column name from the specified column schema.
   * @param column Column schema.
   * @returns Returns the column name.
   */
  @Class.Private()
  private getColumnName(column: Column): string {
    return column.alias || column.name;
  }

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
    return this.getColumnName(column);
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
        const data = columns[name];
        const model = data.model || this.model;
        list.push({
          storage: <string>Schema.getStorage(model),
          local: data.local ? this.getColumnName(<Column>Schema.getColumn(this.model, data.local)) : this.getPrimaryName(),
          foreign: this.getColumnName(<Column>Schema.getColumn(model, data.foreign)),
          virtual: data.name
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
    const data = new this.model();
    const row = <Map<Column>>Schema.getRow(this.model);
    for (const name in row) {
      const column = this.getColumnName(row[name]);
      const source = input ? name : column;
      const target = input ? column : name;
      if (source in entity && entity[source] !== void 0) {
        data[target] = entity[source];
      } else if (all && row[name].required) {
        throw new Error(`Required column '${name}' does not supplied.`);
      }
    }
    return data;
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
   * Default constructor.
   * @param driver Data driver.
   * @param model Entity model.
   * @throws Throws an error when the model is a not valid entity.
   */
  public constructor(driver: Driver, model: Constructor<E>) {
    if (!Schema.getStorage(model)) {
      throw new Error(`There is no storage name, make sure your entity model is a valid.`);
    }
    this.driver = driver;
    this.model = model;
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
      if (name in columns) {
        const column = columns[name];
        if (!column.hidden) {
          data[name] = column.model ? Mapper.normalize(column.model, value) : value;
        }
      } else if (name in virtual) {
        if (value instanceof Array) {
          const list = [];
          for (const entry of value) {
            list.push(Mapper.normalize(virtual[name].model || model, entry));
          }
          data[name] = list;
        } else {
          data[name] = Mapper.normalize(virtual[name].model || model, value);
        }
      }
    }
    return data;
  }
}
