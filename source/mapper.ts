/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Filters from './filters';

import { Entity } from './entity';
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
   * Insert the specified entity list into the storage using a custom model type.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Protected()
  protected async insertManyEx<T extends Types.Entity>(model: Types.Model<T>, entities: T[]): Promise<any[]> {
    return await this.driver.insert(model, Entity.createFullInputArray(model, entities));
  }

  /**
   * Insert the specified entity list into the storage.
   * @param entities Entity list.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Protected()
  protected async insertMany(entities: E[]): Promise<any[]> {
    return await this.insertManyEx(this.model, entities);
  }

  /**
   * Insert the specified entity into the storage using a custom model type.
   * @param model Model type.
   * @param entity Entity data.
   * @returns Returns a promise to get the id of the inserted entry.
   */
  @Class.Protected()
  protected async insertEx<T extends Types.Entity>(model: Types.Model<T>, entity: T): Promise<any> {
    return (await this.insertManyEx(model, [entity]))[0];
  }

  /**
   * Insert the specified entity into the storage.
   * @param entity Entity data.
   * @returns Returns a promise to get the id of the inserted entity.
   */
  @Class.Protected()
  protected async insert(entity: E): Promise<any> {
    return await this.insertEx(this.model, entity);
  }

  /**
   * Find all corresponding entity in the storage.
   * @param query Query filter
   * @param fields Viewed fields.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Protected()
  protected async find(query: Filters.Query, fields: string[] = []): Promise<E[]> {
    return <E[]>Entity.createFullOutputArray(this.model, fields, await this.driver.find(this.model, query, fields));
  }

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param id Entity id.
   * @param fields Viewed fields.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  @Class.Protected()
  protected async findById(id: any, fields: string[] = []): Promise<E | undefined> {
    const data = await this.driver.findById(this.model, id, fields);
    if (data !== void 0) {
      return Entity.createFullOutput(this.model, fields, data);
    }
    return void 0;
  }

  /**
   * Update all entities that corresponds to the specified match using a custom model type.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Protected()
  protected async updateEx<T extends Types.Entity>(model: Types.Model<T>, match: Filters.Match, entity: T): Promise<number> {
    return await this.driver.update(model, match, Entity.createFullInput(model, entity));
  }

  /**
   * Update all entities that corresponds to the specified match.
   * @param match Matching filter.
   * @param entity Entity data.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Protected()
  protected async update(match: Filters.Match, entity: Types.Entity): Promise<number> {
    return await this.driver.update(this.model, match, Entity.createInput(this.model, entity));
  }

  /**
   * Update the entity that corresponds to the specified id using a custom model type.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateByIdEx<T extends Types.Entity>(model: Types.Model<T>, id: any, entity: T): Promise<boolean> {
    return await this.driver.updateById(model, id, Entity.createFullInput(model, entity));
  }

  /**
   * Update the entity that corresponds to the specified id.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateById(id: any, entity: Types.Entity): Promise<boolean> {
    return await this.driver.updateById(this.model, id, Entity.createInput(this.model, entity));
  }

  /**
   * Replace the entity that corresponds to the specified id using a custom model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
   */
  @Class.Protected()
  protected async replaceByIdEx<T extends Types.Entity>(model: Types.Model<T>, id: any, entity: Types.Entity): Promise<boolean> {
    return await this.driver.replaceById(model, id, Entity.createInput(model, entity));
  }

  /**
   * Replace the entity that corresponds to the specified id.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
   */
  @Class.Protected()
  protected async replaceById(id: any, entity: Types.Entity): Promise<boolean> {
    return await this.driver.replaceById(this.model, id, Entity.createInput(this.model, entity));
  }

  /**
   * Delete all entities that corresponds to the specified match.
   * @param match Matching filter.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Protected()
  protected async delete(match: Filters.Match): Promise<number> {
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
   * Count all corresponding entities from the storage.
   * @param query Query filter.
   * @returns Returns a promise to get the total amount of found entities.
   */
  @Class.Protected()
  protected async count(query: Filters.Query): Promise<number> {
    return await this.driver.count(this.model, query);
  }

  /**
   * Generate a new normalized entity based on the specified input data.
   * @param input Input data.
   * @returns Returns the new normalized entity data.
   */
  @Class.Protected()
  protected normalize(input: E): E {
    return Entity.normalize(this.model, input);
  }

  /**
   * Normalize all entities in the specified input list.
   * @param list Input list.
   * @returns Returns the list of normalized entities.
   */
  @Class.Protected()
  protected normalizeAll(...list: E[]): E[] {
    return list.map((entity: E) => this.normalize(entity));
  }

  /**
   * Normalize all entities in the specified input list to a new map of entities.
   * @param list Input list.
   * @returns Returns the map of normalized entities.
   */
  @Class.Protected()
  protected normalizeAsMap(...list: E[]): E {
    const column = Schema.getPrimaryColumn(this.model);
    const primary = column.alias || column.name;
    const map = <E>{};
    for (const input of list) {
      const normalized = this.normalize(input);
      (<any>map)[normalized[primary]] = normalized;
    }
    return map;
  }

  /**
   * Default constructor.
   * @param driver Data driver.
   * @param model Entity model.
   * @throws Throws an error when the model isn't a valid entity.
   */
  public constructor(driver: Driver, model: Types.Model<E>) {
    super();
    if (!Schema.isEntity(model)) {
      throw new Error(`The specified model isn't a valid entity model.`);
    }
    this.driver = driver;
    this.model = model;
  }
}
