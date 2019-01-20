/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Constructor } from './types';
import { Expression } from './expression';
import { Aggregation } from './aggregation';
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
  insert<T extends Entity>(model: Constructor<T>, entities: T[]): Promise<any[]>;
  /**
   * Find the corresponding entities from the storage.
   * @param model Model type.
   * @param aggregation List of virtual columns.
   * @param filters List of expressions filter.
   * @returns Returns the  promise to get the list of entities found.
   */
  find<T extends Entity>(model: Constructor<T>, aggregation: Aggregation[], filters: Expression[]): Promise<T[]>;
  /**
   * Find the entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param aggregation List of virtual columns.
   * @param id Entity id.
   * @returns Returns the promise to get the entity found or undefined when the entity was not found.
   */
  findById<T extends Entity>(model: Constructor<T>, aggregation: Aggregation[], id: any): Promise<T | undefined>;
  /**
   * Update all entities that corresponds to the specified filter.
   * @param model Model type.
   * @param entity Entity data to be updated.
   * @param filter Expression filter.
   * @returns Returns the promise to get the number of updated entities.
   */
  update(model: Constructor<Entity>, entity: Entity, filter: Expression): Promise<number>;
  /**
   * Update a entity that corresponds to the specified entity id.
   * @param model Model type.
   * @param entity Entity data to be updated.
   * @param id Entity id.
   * @returns Returns the promise to get true when the entity has been updated or false otherwise.
   */
  updateById(model: Constructor<Entity>, entity: Entity, id: any): Promise<boolean>;
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
   * @param id Entity id.
   * @return Returns the promise to get true when the entity has been deleted or false otherwise.
   */
  deleteById(model: Constructor<Entity>, id: any): Promise<boolean>;
}
