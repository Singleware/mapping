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
   * @returns Returns a promise to get the Id list of all inserted entities or undefined when an error occurs.
   */
  insert<E, R, O extends Types.Options>(model: Types.ModelClass<E>, entities: E[], options: O): Promise<R[] | undefined>;

  /**
   * Find all corresponding entities from the storage.
   * @param model Model type.
   * @param query Query filter.
   * @param select Fields to select.
   * @param options Find options.
   * @returns Returns a promise to get the list of entities found or undefined when an error occurs.
   */
  find<E, O extends Types.Options>(model: Types.ModelClass<E>, query: Filters.Query, select: string[], options: O): Promise<E[] | undefined>;

  /**
   * Find the entity that corresponds to the specified entity Id.
   * @param model Model type.
   * @param id Entity Id.
   * @param select Fields to select.
   * @param options Find options.
   * @returns Returns a promise to get the entity found either undefined when the entity was not found or an error occurs.
   */
  findById<E, I, O extends Types.Options>(model: Types.ModelClass<E>, id: I, select: string[], options: O): Promise<E | undefined>;

  /**
   * Update all entities that corresponds to the specified match.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get the number of updated entities or undefined when an error occurs.
   */
  update<E, O extends Types.Options>(model: Types.ModelClass<E>, match: Filters.Match, entity: E, options: O): Promise<number | undefined>;

  /**
   * Update a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get true when the entity was updated either undefined when an error occurs or false otherwise.
   */
  updateById<E, I, O extends Types.Options>(model: Types.ModelClass<E>, id: I, entity: E, options: O): Promise<boolean | undefined>;

  /**
   * Replace a entity that corresponds to the specified entity Id.
   * @param model Model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @param options Replace options.
   * @returns Returns a promise to get true when the entity was replaced either undefined when an error occurs or false otherwise.
   */
  replaceById<E, I, O extends Types.Options>(model: Types.ModelClass<E>, id: I, entity: E, options: O): Promise<boolean | undefined>;

  /**
   * Delete all entities that corresponds to the specified match.
   * @param model Model type.
   * @param match Matching filter.
   * @param options Delete options.
   * @return Returns a promise to get the number of deleted entities or undefined when an error occurs.
   */
  delete<O extends Types.Options>(model: Types.ModelClass, match: Filters.Match, options: O): Promise<number | undefined>;

  /**
   * Delete the entity that corresponds to the specified entity Id.
   * @param model Model type.
   * @param id Entity Id.
   * @param options Delete options.
   * @return Returns a promise to get true when the entity was deleted either undefined when an error occurs or false otherwise.
   */
  deleteById<I, O extends Types.Options>(model: Types.ModelClass, id: I, options: O): Promise<boolean | undefined>;

  /**
   * Count all corresponding entities from the storage.
   * @param model Model type.
   * @param query Query filter.
   * @param options Count options.
   * @returns Returns a promise to get the total amount of found entities or undefined when an error occurs.
   */
  count<O extends Types.Options>(model: Types.ModelClass, query: Filters.Query, options: O): Promise<number | undefined>;
}
