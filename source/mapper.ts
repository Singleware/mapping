/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import { ClassConstructor } from './types';
import { Schema } from './schema';
import { Driver } from './driver';
import { Entity } from './entity';
import { Expression } from './expression';
import { Column } from './column';
import { Row } from './row';

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
  private model: ClassConstructor<E>;

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
    const column = <Column>Schema.getPrimaryColumn(this.model);
    if (!column) {
      throw new Error(`There is no primary column to be used.`);
    }
    return this.getColumnName(column);
  }

  /**
   * Gets the storage name.
   * @returns Returns the storage name.
   * @throws Throws an error when the storage name was not defined.
   */
  @Class.Private()
  private getStorageName(): string {
    const name = Schema.getStorageName(this.model);
    if (!name) {
      throw new Error(`There is no storage name, make sure your entity model is a valid.`);
    }
    return name;
  }

  /**
   * Gets a new entity based on the specified entity model.
   * @param entity Entity data.
   * @param input Determines whether the entity will be used for input or output.
   * @param all Determines if all required properties must be provided.
   * @returns Returns the new generated entity data based on entity model.
   * @throws Throws an error when a required column is not supplied.
   */
  @Class.Private()
  private getEntity(entity: Entity, input: boolean, all: boolean): E {
    const data = new this.model();
    const row = <Row>Schema.getRow(this.model);
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
   * Gets a new list of entities based on the specified entity model.
   * @param entities Entities list.
   * @param input Determines whether the entities will be used for an input or output.
   * @param all Determines whether all properties must be provided.
   * @returns Returns the new entities list.
   */
  @Class.Private()
  private getEntities(entities: Entity[], input: boolean, all: boolean): E[] {
    const list = [];
    for (const entity of entities) {
      list.push(this.getEntity(entity, input, all));
    }
    return list;
  }

  /**
   * Generate a new normalized entity based on the specified entity model.
   * @param entity Entity data.
   * @returns Returns the new generated entity data.
   */
  @Class.Public()
  protected normalize(entity: E): Entity {
    const schema = <Row>Schema.getRow(this.model);
    const data = <Entity>{};
    for (const column in entity) {
      if (column in schema && !schema[column].hidden) {
        data[column] = entity[column];
      }
    }
    return data;
  }

  /**
   * Insert the specified entities list into the storage.
   * @param entities Entities list.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Public()
  protected async insertMany(entities: E[]): Promise<any[]> {
    return await this.driver.insert(this.getStorageName(), ...this.getEntities(entities, true, true));
  }

  /**
   * Insert the specified entity into the storage.
   * @param entity Entity data.
   * @returns Returns a promise to get the id of inserted entry.
   */
  @Class.Public()
  protected async insert(entity: E): Promise<any> {
    return (await this.insertMany([entity]))[0];
  }

  /**
   * Find the corresponding entity in the storage.
   * @param filter Filter expression.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Public()
  protected async find(filter: Expression): Promise<E[]> {
    return await this.getEntities(await this.driver.find(this.getStorageName(), filter), false, true);
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param id Entity id.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  @Class.Public()
  protected async findById(id: any): Promise<E | undefined> {
    const entity = await this.driver.findById(this.getStorageName(), this.getPrimaryName(), id);
    if (entity) {
      return await this.getEntity(entity, false, true);
    }
  }

  /**
   * Update all entities that corresponds to the specified filter.
   * @param filter Filter expression.
   * @param entity Entity data to be updated.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Public()
  protected async update(filter: Expression, entity: E): Promise<number> {
    return await this.driver.update(this.getStorageName(), filter, this.getEntity(entity, true, false));
  }

  /**
   * Update a entity that corresponds to the specified id.
   * @param id Entity id.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  protected async updateById(id: any, entity: E): Promise<boolean> {
    return await this.driver.updateById(this.getStorageName(), this.getPrimaryName(), id, this.getEntity(entity, true, false));
  }

  /**
   * Delete all entities that corresponds to the specified filter.
   * @param filter Filter columns.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Public()
  protected async delete(filter: Expression): Promise<number> {
    return await this.driver.delete(this.getStorageName(), filter);
  }

  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param id Entity id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  protected async deleteById(id: any): Promise<number> {
    return await this.driver.deleteById(this.getStorageName(), this.getPrimaryName(), id);
  }

  /**
   * Default constructor.
   * @param driver Data driver.
   * @param model Entity model.
   */
  public constructor(driver: Driver, model: ClassConstructor<E>) {
    this.driver = driver;
    this.model = model;
  }
}
