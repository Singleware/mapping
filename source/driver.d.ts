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
   * @param options Insert options.
   * @returns Returns a promise to get the id list of inserted entities.
   */
  insert<T extends Types.Entity, U extends {}>(model: Types.ModelClass<T>, entities: T[], options: U): Promise<any[]>;

  /**
   * Find all corresponding entities from the storage.
   * @param model Model type.
   * @param query Query filter.
   * @param select Fields to select.
   * @param options Find options.
   * @returns Returns a promise to get the list of entities found.
   */
  find<T extends Types.Entity, U extends {}>(
    model: Types.ModelClass<T>,
    query: Filters.Query,
    select: string[],
    options: U
  ): Promise<T[]>;

  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param select Fields to select.
   * @param options Find options.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  findById<T extends Types.Entity, U extends {}>(
    model: Types.ModelClass<T>,
    id: any,
    select: string[],
    options: U
  ): Promise<T | undefined>;

  /**
   * Update all entities that corresponds to the specified match.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get the number of updated entities.
   */
  update<U extends {}>(model: Types.ModelClass, match: Filters.Match, entity: Types.Entity, options: U): Promise<number>;

  /**
   * Update a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get true when the entity has been updated or false otherwise.
   */
  updateById<U extends {}>(model: Types.ModelClass, id: any, entity: Types.Entity, options: U): Promise<boolean>;

  /**
   * Replace a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @param options Replace options.
   * @returns Returns a promise to get true when the entity has been replaced or false otherwise.
   */
  replaceById<U extends {}>(model: Types.ModelClass, id: any, entity: Types.Entity, options: U): Promise<boolean>;

  /**
   * Delete all entities that corresponds to the specified match.
   * @param model Model type.
   * @param match Matching filter.
   * @param options Delete options.
   * @return Returns a promise to get the number of deleted entities.
   */
  delete<U extends {}>(model: Types.ModelClass, match: Filters.Match, options: U): Promise<number>;

  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param options Delete options.
   * @return Returns a promise to get true when the entity has been deleted or false otherwise.
   */
  deleteById<U extends {}>(model: Types.ModelClass, id: any, options: U): Promise<boolean>;

  /**
   * Count all corresponding entities from the storage.
   * @param model Model type.
   * @param query Query filter.
   * @param options Count options.
   * @returns Returns a promise to get the total amount of found entities.
   */
  count<U extends {}>(model: Types.ModelClass, query: Filters.Query, options: U): Promise<number>;
}
