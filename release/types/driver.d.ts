/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Expression } from './expression';
import { Entity } from './entity';

/**
 * Data mapper driver interface.
 */
export interface Driver {
  /**
   * Insert the specified entity into the storage.
   * @param storage Storage name.
   * @param entities Entity list.
   * @returns Returns the list inserted entities.
   */
  insert<T extends Entity>(storage: string, ...entities: T[]): any;
  /**
   * Find the corresponding entities from the storage.
   * @param storage Storage name.
   * @param filter Filter expression.
   * @returns Returns the list of entities found.
   */
  find<T extends Entity>(storage: string, filter: Expression): any;
  /**
   * Find the entity that corresponds to the specified entity id.
   * @param storage Storage name.
   * @param column Id column name.
   * @param id Entity id value.
   * @returns Returns the found entity or undefined when the entity was not found.
   */
  findById<T extends Entity>(storage: string, column: string, id: any): any;
  /**
   * Update all entities that corresponds to the specified filter.
   * @param storage Storage name.
   * @param filter Filter expression.
   * @param entity Entity data to be updated.
   * @returns Returns the number of updated entities.
   */
  update<T extends Entity>(storage: string, filter: Expression, entity: T): any;
  /**
   * Update a entity that corresponds to the specified entity id.
   * @param storage Storage name.
   * @param column Id column name.
   * @param id Entity id.
   * @param entity Entity data to be updated.
   * @returns Returns true when the entity has been updated or false otherwise.
   */
  updateById<T extends Entity>(storage: string, column: string, id: any, entity: T): any;
  /**
   * Delete all entities that corresponds to the specified filter.
   * @param storage Storage name.
   * @param filter Filter columns.
   * @return Returns the number of deleted entities.
   */
  delete<T extends Entity>(storage: string, filter: Expression): any;
  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param storage Storage name.
   * @param column Id column name.
   * @param id Entity id.
   * @return Returns true when the entity has been deleted or false otherwise.
   */
  deleteById<T extends Entity>(storage: string, column: string, id: any): any;
}
