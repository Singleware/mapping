/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Constructor } from './types';
import { Expression } from './expression';
import { Aggregate } from './aggregate';
import { Entity } from './entity';

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
  insert<T extends Entity>(model: Constructor<T>, ...entities: T[]): Promise<any[]>;
  /**
   * Find the corresponding entities from the storage.
   * @param model Model type.
   * @param filter Filter expression.
   * @param aggregate Virtual columns.
   * @returns Returns the  promise to get the list of entities found.
   */
  find<T extends Entity>(model: Constructor<T>, filter: Expression, aggregate: Aggregate[]): Promise<T[]>;
  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param value Entity id.
   * @param aggregate Virtual columns.
   * @returns Returns the promise to get the entity found or undefined when the entity was not found.
   */
  findById<T extends Entity>(model: Constructor<T>, value: any, aggregate: Aggregate[]): Promise<T | undefined>;
  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Filter expression.
   * @param entity Entity data to be updated.
   * @returns Returns the promise to get the number of updated entities.
   */
  update(model: Constructor<Entity>, filter: Expression, entity: Entity): Promise<number>;
  /**
   * Update a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param value Entity id.
   * @param entity Entity data to be updated.
   * @returns Returns the promise to get true when the entity has been updated or false otherwise.
   */
  updateById(model: Constructor<Entity>, value: any, entity: Entity): Promise<boolean>;
  /**
   * Delete all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param filter Filter columns.
   * @return Returns the promise to get the number of deleted entities.
   */
  delete(model: Constructor<Entity>, filter: Expression): Promise<number>;
  /**
   * Delete the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param value Entity id.
   * @return Returns the promise to get true when the entity has been deleted or false otherwise.
   */
  deleteById(model: Constructor<Entity>, value: any): Promise<boolean>;
}
