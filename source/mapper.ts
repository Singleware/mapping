/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Filters from './filters';
import * as Entities from './entities';

import { Schema } from './schema';
import { Driver } from './driver';

/**
 * Generic data mapper class.
 */
@Class.Describe()
export class Mapper<Entity extends Types.Entity> extends Class.Null {
  /**
   * Entity model.
   */
  @Class.Private()
  private model: Types.ModelClass<Entity>;

  /**
   * Data driver.
   */
  @Class.Private()
  private driver: Driver;

  /**
   * Default constructor.
   * @param driver Data driver.
   * @param model Entity model.
   * @throws Throws an error when the model isn't a valid entity.
   */
  public constructor(driver: Driver, model: Types.ModelClass<Entity>) {
    super();
    if (!Schema.isEntity(model)) {
      throw new Error(`Invalid entity model.`);
    }
    this.driver = driver;
    this.model = model;
  }

  /**
   * Insert the specified entity list into the storage using a custom model type.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Public()
  public async insertManyEx<T extends Types.Entity>(model: Types.ModelClass<T>, entities: T[]): Promise<any[]> {
    return await this.driver.insert(model, Entities.Inputer.createFullArray(model, entities));
  }

  /**
   * Insert the specified entity list into the storage.
   * @param entities Entity list.
   * @returns Returns a promise to get the Id list of all inserted entities.
   */
  @Class.Public()
  public async insertMany(entities: Entity[]): Promise<any[]> {
    return await this.insertManyEx(this.model, entities);
  }

  /**
   * Insert the specified entity into the storage using a custom model type.
   * @param model Model type.
   * @param entity Entity data.
   * @returns Returns a promise to get the id of the inserted entry.
   */
  @Class.Public()
  public async insertEx<T extends Types.Entity>(model: Types.ModelClass<T>, entity: T): Promise<any> {
    return (await this.insertManyEx(model, [entity]))[0];
  }

  /**
   * Insert the specified entity into the storage.
   * @param entity Entity data.
   * @returns Returns a promise to get the id of the inserted entity.
   */
  @Class.Public()
  public async insert(entity: Entity): Promise<any> {
    return await this.insertEx(this.model, entity);
  }

  /**
   * Find all corresponding entity in the storage.
   * @param query Query filter
   * @param select Fields to select.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Public()
  public async find(query: Filters.Query, select: string[] = []): Promise<Entity[]> {
    const entities = await this.driver.find(this.model, query, select);
    return <Entity[]>Entities.Outputer.createFullArray(this.model, entities, select);
  }

  /**
   * Find the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param select Fields to select.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById(id: any, select: string[] = []): Promise<Entity | undefined> {
    const entity = await this.driver.findById(this.model, id, select);
    if (entity !== void 0) {
      return Entities.Outputer.createFull(this.model, entity, select);
    }
    return void 0;
  }

  /**
   * Gets the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param select Fields to select.
   * @returns Returns a promise to get the entity.
   * @throws Throws an error when the entity wasn't found.
   */
  @Class.Public()
  public async getById(id: any, select: string[] = []): Promise<Entity> {
    const entity = await this.findById(id, select);
    if (!entity) {
      throw new Error(`Failed to find entity by Id.`);
    }
    return entity;
  }

  /**
   * Update all entities that corresponds to the specified match using a custom model type.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Public()
  public async updateEx<T extends Types.Entity>(
    model: Types.ModelClass<T>,
    match: Filters.Match,
    entity: T
  ): Promise<number> {
    return await this.driver.update(model, match, Entities.Inputer.createFull(model, entity));
  }

  /**
   * Update all entities that corresponds to the specified match.
   * @param match Matching filter.
   * @param entity Entity data.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Public()
  public async update(match: Filters.Match, entity: Types.Entity): Promise<number> {
    return await this.driver.update(this.model, match, Entities.Inputer.create(this.model, entity));
  }

  /**
   * Update the entity that corresponds to the specified id using a custom model type.
   * @param model Model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateByIdEx<T extends Types.Entity>(model: Types.ModelClass<T>, id: any, entity: T): Promise<boolean> {
    return await this.driver.updateById(model, id, Entities.Inputer.createFull(model, entity));
  }

  /**
   * Update the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Public()
  public async updateById(id: any, entity: Types.Entity): Promise<boolean> {
    return await this.driver.updateById(this.model, id, Entities.Inputer.create(this.model, entity));
  }

  /**
   * Replace the entity that corresponds to the specified entity Id using a custom model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
   */
  @Class.Public()
  public async replaceByIdEx<T extends Types.Entity>(
    model: Types.ModelClass<T>,
    id: any,
    entity: Types.Entity
  ): Promise<boolean> {
    return await this.driver.replaceById(model, id, Entities.Inputer.createFull(model, entity));
  }

  /**
   * Replace the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param entity Entity data.
   * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
   */
  @Class.Public()
  public async replaceById(id: any, entity: Types.Entity): Promise<boolean> {
    return await this.driver.replaceById(this.model, id, Entities.Inputer.create(this.model, entity));
  }

  /**
   * Delete all entities that corresponds to the specified match.
   * @param match Matching filter.
   * @return Returns a promise to get the number of deleted entities.
   */
  @Class.Public()
  public async delete(match: Filters.Match): Promise<number> {
    return await this.driver.delete(this.model, match);
  }

  /**
   * Delete the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
   */
  @Class.Public()
  public async deleteById(id: any): Promise<boolean> {
    return await this.driver.deleteById(this.model, id);
  }

  /**
   * Count all corresponding entities from the storage.
   * @param query Query filter.
   * @returns Returns a promise to get the total amount of found entities.
   */
  @Class.Public()
  public async count(query: Filters.Query): Promise<number> {
    return await this.driver.count(this.model, query);
  }

  /**
   * Generate a new normalized entity based on the specified entity data.
   * @param entity Entity data.
   * @param alias Determines whether or not all column names should be aliased.
   * @param unsafe Determines whether or not all hidden columns should be visible.
   * @param unroll Determines whether or not all columns should be unrolled.
   * @returns Returns the normalized entity.
   */
  @Class.Public()
  public normalize(entity: Entity, alias?: boolean, unsafe?: boolean, unroll?: boolean): Entity {
    return Entities.Normalizer.create(this.model, entity, alias, unsafe, unroll);
  }

  /**
   * Normalize all entities in the specified entity list.
   * @param entities Entity list.
   * @param alias Determines whether or not all column names should be aliased.
   * @param unsafe Determines whether or not all hidden columns should be visible.
   * @param unroll Determines whether or not all columns should be unrolled.
   * @returns Returns the list of normalized entities.
   */
  @Class.Public()
  public normalizeAll(entities: Entity[], alias?: boolean, unsafe?: boolean, unroll?: boolean): Entity[] {
    return entities.map(entity => this.normalize(entity, alias, unsafe, unroll));
  }

  /**
   * Normalize all entities in the specified entity list to a new map of entities.
   * @param entities Entity list.
   * @param alias Determines whether or not all column names should be aliased.
   * @param unsafe Determines whether or not all hidden columns should be visible.
   * @param unroll Determines whether or not all columns should be unrolled.
   * @returns Returns the map of normalized entities.
   */
  @Class.Public()
  public normalizeAsMap(entities: Entity[], alias?: boolean, unsafe?: boolean, unroll?: boolean): Types.Map<Entity> {
    const column = Schema.getPrimaryColumn(this.model);
    const primary = Schema.getColumnName(column);
    const data = <Types.Map<Entity>>{};
    for (const input of entities) {
      const entity = this.normalize(input, alias, unsafe, unroll);
      data[entity[primary]] = entity;
    }
    return data;
  }
}
