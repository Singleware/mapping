/**
 * Copyright (C) 2018 Silas B. Domingos
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
   * @param entities Entity list.
   * @returns Returns the promise to get the id list of inserted entities.
   */
  insert<T extends Types.Entity>(model: Types.Model<T>, entities: T[]): Promise<any[]>;
  /**
   * Find the corresponding entities from the storage.
   * @param model Model type.
   * @param joins List of junctions.
   * @param filters List of filters.
   * @param sort Sorting fields.
   * @param limit Result limits.
   * @returns Returns the  promise to get the list of entities found.
   */
  find<T extends Types.Entity>(
    model: Types.Model<T>,
    joins: Statements.Join[],
    filters: Statements.Filter[],
    sort?: Statements.Sort,
    limit?: Statements.Limit
  ): Promise<T[]>;
  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param joins List of junctions.
   * @param id Entity id.
   * @returns Returns the promise to get the entity found or undefined when the entity was not found.
   */
  findById<T extends Types.Entity>(model: Types.Model<T>, joins: Statements.Join[], id: any): Promise<T | undefined>;
  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param entity Entity data to be updated.
   * @param filter Expression filter.
   * @returns Returns the promise to get the number of updated entities.
   */
  update(model: Types.Model, entity: Types.Entity, filter: Statements.Filter): Promise<number>;
  /**
   * Update a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param entity Entity data to be updated.
   * @param id Entity id.
   * @returns Returns the promise to get true when the entity has been updated or false otherwise.
   */
  updateById(model: Types.Model, entity: Types.Entity, id: any): Promise<boolean>;
  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Filter columns.
   * @return Returns the promise to get the number of deleted entities.
   */
  delete(model: Types.Model, filter: Statements.Filter): Promise<number>;
  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param id Entity id.
   * @return Returns the promise to get true when the entity has been deleted or false otherwise.
   */
  deleteById(model: Types.Model, id: any): Promise<boolean>;
}
