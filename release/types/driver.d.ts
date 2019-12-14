/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from './types';
import * as Filters from './filters';

/**
 * Data mapper driver interface.
 */
export interface Driver {
  /**
   * Insert the specified entity list into the storage.
   * @param model Model type.
   * @param entities Entity list.
   * @returns Returns a promise to get the id list of inserted entities.
   */
  insert<T extends Types.Entity>(model: Types.ModelClass<T>, entities: T[]): Promise<any[]>;

  /**
   * Find all corresponding entities from the storage.
   * @param model Model type.
   * @param query Query filter.
   * @param select Fields to select.
   * @returns Returns a promise to get the list of entities found.
   */
  find<T extends Types.Entity>(model: Types.ModelClass<T>, query: Filters.Query, select: string[]): Promise<T[]>;

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param select Fields to select.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  findById<T extends Types.Entity>(model: Types.ModelClass<T>, id: any, select: string[]): Promise<T | undefined>;

  /**
   * Update all entities that corresponds to the specified match.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @returns Returns a promise to get the number of updated entities.
   */
  update(model: Types.ModelClass, match: Filters.Match, entity: Types.Entity): Promise<number>;

  /**
   * Update a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get true when the entity has been updated or false otherwise.
   */
  updateById(model: Types.ModelClass, id: any, entity: Types.Entity): Promise<boolean>;

  /**
   * Replace a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @returns Returns a promise to get true when the entity has been replaced or false otherwise.
   */
  replaceById(model: Types.ModelClass, id: any, entity: Types.Entity): Promise<boolean>;

  /**
   * Delete all entities that corresponds to the specified match.
   * @param model Model type.
   * @param match Matching filter.
   * @return Returns a promise to get the number of deleted entities.
   */
  delete(model: Types.ModelClass, match: Filters.Match): Promise<number>;

  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns a promise to get true when the entity has been deleted or false otherwise.
   */
  deleteById(model: Types.ModelClass, id: any): Promise<boolean>;

  /**
   * Count all corresponding entities from the storage.
   * @param model Model type.
   * @param query Query filter.
   * @returns Returns a promise to get the total amount of found entities.
   */
  count(model: Types.ModelClass, query: Filters.Query): Promise<number>;
}
