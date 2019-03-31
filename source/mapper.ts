/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Statements from './statements';

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
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Protected()
  protected async insertManyEx<T extends Types.Entity>(model: Types.Model<T>, entities: T[], views: string[] = [Types.View.ALL]): Promise<any[]> {
    return await this.driver.insert(model, views, Entity.createFullInputArray(model, views, entities));
  }

  /**
   * Insert the specified entity list into the storage.
   * @param entities Entity list.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the id list of all inserted entities.
   */
  @Class.Protected()
  protected async insertMany(entities: E[], views: string[] = [Types.View.ALL]): Promise<any[]> {
    return await this.insertManyEx(this.model, entities, views);
  }

  /**
   * Insert the specified entity into the storage using a custom model type.
   * @param model Model type.
   * @param entity Entity data.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the id of the inserted entry.
   */
  @Class.Protected()
  protected async insertEx<T extends Types.Entity>(model: Types.Model<T>, entity: T, views: string[] = [Types.View.ALL]): Promise<any> {
    return (await this.insertManyEx(model, [entity], views))[0];
  }

  /**
   * Insert the specified entity into the storage.
   * @param entity Entity data.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the id of the inserted entity.
   */
  @Class.Protected()
  protected async insert(entity: E, views: string[] = [Types.View.ALL]): Promise<any> {
    return await this.insertEx(this.model, entity, views);
  }

  /**
   * Find all corresponding entity in the storage.
   * @param filter Field filter.
   * @param views View modes, use Types.View.ALL to see all fields.
   * @returns Returns a promise to get the list of entities found.
   */
  @Class.Protected()
  protected async find(filter: Statements.Filter, views: string[] = [Types.View.ALL]): Promise<E[]> {
    return <E[]>Entity.createFullOutputArray(this.model, views, await this.driver.find(this.model, views, filter));
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
    if (data !== void 0) {
      return Entity.createOutput(this.model, views, data);
    }
    return void 0;
  }

  /**
   * Update all entities that corresponds to the specified match using a custom model type.
   * @param model Model type.
   * @param match Matching fields.
   * @param entity Entity data to be updated.
   * @param views View modes.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Protected()
  protected async updateEx<T extends Types.Entity>(model: Types.Model<T>, match: Statements.Match, entity: T, views: string[] = [Types.View.ALL]): Promise<number> {
    return await this.driver.update(model, views, match, Entity.createInput(model, views, entity));
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
    return await this.updateEx(this.model, match, entity, views);
  }

  /**
   * Update the entity that corresponds to the specified id using a custom model type.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data to be updated.
   * @param views View modes.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateByIdEx<T extends Types.Entity>(model: Types.Model<T>, id: any, entity: T, views: string[] = [Types.View.ALL]): Promise<boolean> {
    return await this.driver.updateById(model, views, id, Entity.createInput(model, views, entity));
  }

  /**
   * Update the entity that corresponds to the specified id.
   * @param id Entity id.
   * @param entity Entity data to be updated.
   * @param views View modes.
   * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
   */
  @Class.Protected()
  protected async updateById(id: any, entity: Types.Entity, views: string[] = [Types.View.ALL]): Promise<boolean> {
    return await this.updateByIdEx(this.model, id, entity, views);
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
   * Count all corresponding entities from the storage.
   * @param filter Field filter.
   * @param views View modes.
   * @returns Returns a promise to get the total amount of found entities.
   */
  @Class.Protected()
  protected async count(filter: Statements.Filter, views: string[] = [Types.View.ALL]): Promise<number> {
    return await this.driver.count(this.model, views, filter);
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
    const map = <E>{};
    for (const input of list) {
      const normalized = this.normalize(input);
      map[normalized[column.alias || column.name]] = normalized;
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
