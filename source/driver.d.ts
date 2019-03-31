/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from './types';
import * as Statements from './statements';

/**
 * Data mapper driver interface.
 */
export interface Driver {
  /**
   * Insert the specified entity list into the storage.
   * @param model Model type.
   * @param views Views mode.
   * @param entities Entity list.
   * @returns Returns a promise to get the id list of inserted entities.
   */
  insert<T extends Types.Entity>(model: Types.Model<T>, views: string[], entities: T[]): Promise<any[]>;
  /**
   * Find all corresponding entities from the storage.
   * @param model Model type.
   * @param views View modes.
   * @param filter Field filter.
   * @returns Returns a promise to get the list of entities found.
   */
  find<T extends Types.Entity>(model: Types.Model<T>, views: string[], filter: Statements.Filter): Promise<T[]>;
  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param views View mode.
   * @param id Entity id.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  findById<T extends Types.Entity>(model: Types.Model<T>, views: string[], id: any): Promise<T | undefined>;
  /**
   * Update all entities that corresponds to the specified match.
   * @param model Model type.
   * @param views Views mode.
   * @param match Matching fields.
   * @param entity Entity data to be updated.
   * @returns Returns a promise to get the number of updated entities.
   */
  update(model: Types.Model, views: string[], match: Statements.Match, entity: Types.Entity): Promise<number>;
  /**
   * Update a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param views Views mode.
   * @param id Entity id.
   * @param entity Entity data to be updated.
   * @returns Returns a promise to get true when the entity has been updated or false otherwise.
   */
  updateById(model: Types.Model, views: string[], id: any, entity: Types.Entity): Promise<boolean>;
  /**
   * Delete all entities that corresponds to the specified match.
   * @param model Model type.
   * @param match Matching fields.
   * @return Returns a promise to get the number of deleted entities.
   */
  delete(model: Types.Model, match: Statements.Match): Promise<number>;
  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns a promise to get true when the entity has been deleted or false otherwise.
   */
  deleteById(model: Types.Model, id: any): Promise<boolean>;
  /**
   * Count all corresponding entities from the storage.
   * @param model Model type.
   * @param views View modes.
   * @param filter Field filter.
   * @returns Returns a promise to get the total amount of found entities.
   */
  count(model: Types.Model, views: string[], filter: Statements.Filter): Promise<number>;
}
