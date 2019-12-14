/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from './types';
import * as Filters from './filters';
import { Driver } from './driver';
/**
 * Generic data mapper class.
 */
export declare class Mapper<Entity extends Types.Entity> extends Class.Null {
    /**
     * Entity model.
     */
    private model;
    /**
     * Data driver.
     */
    private driver;
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     * @throws Throws an error when the model isn't a valid entity.
     */
    constructor(driver: Driver, model: Types.ModelClass<Entity>);
    /**
     * Insert the specified entity list into the storage using a custom model type.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    insertManyEx<T extends Types.Entity>(model: Types.ModelClass<T>, entities: T[]): Promise<any[]>;
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @returns Returns a promise to get the Id list of all inserted entities.
     */
    insertMany(entities: Entity[]): Promise<any[]>;
    /**
     * Insert the specified entity into the storage using a custom model type.
     * @param model Model type.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of the inserted entry.
     */
    insertEx<T extends Types.Entity>(model: Types.ModelClass<T>, entity: T): Promise<any>;
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of the inserted entity.
     */
    insert(entity: Entity): Promise<any>;
    /**
     * Find all corresponding entity in the storage.
     * @param query Query filter
     * @param select Fields to select.
     * @returns Returns a promise to get the list of entities found.
     */
    find(query: Filters.Query, select?: string[]): Promise<Entity[]>;
    /**
     * Find the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param select Fields to select.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    findById(id: any, select?: string[]): Promise<Entity | undefined>;
    /**
     * Gets the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param select Fields to select.
     * @returns Returns a promise to get the entity.
     * @throws Throws an error when the entity wasn't found.
     */
    getById(id: any, select?: string[]): Promise<Entity>;
    /**
     * Update all entities that corresponds to the specified match using a custom model type.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    updateEx<T extends Types.Entity>(model: Types.ModelClass<T>, match: Filters.Match, entity: T): Promise<number>;
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    update(match: Filters.Match, entity: Types.Entity): Promise<number>;
    /**
     * Update the entity that corresponds to the specified id using a custom model type.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateByIdEx<T extends Types.Entity>(model: Types.ModelClass<T>, id: any, entity: T): Promise<boolean>;
    /**
     * Update the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    updateById(id: any, entity: Types.Entity): Promise<boolean>;
    /**
     * Replace the entity that corresponds to the specified entity Id using a custom model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    replaceByIdEx<T extends Types.Entity>(model: Types.ModelClass<T>, id: any, entity: Types.Entity): Promise<boolean>;
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    replaceById(id: any, entity: Types.Entity): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @return Returns a promise to get the number of deleted entities.
     */
    delete(match: Filters.Match): Promise<number>;
    /**
     * Delete the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    deleteById(id: any): Promise<boolean>;
    /**
     * Count all corresponding entities from the storage.
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    count(query: Filters.Query): Promise<number>;
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the normalized entity.
     */
    normalize(entity: Entity, alias?: boolean, unsafe?: boolean, unroll?: boolean): Entity;
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entity list.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the list of normalized entities.
     */
    normalizeAll(entities: Entity[], alias?: boolean, unsafe?: boolean, unroll?: boolean): Entity[];
    /**
     * Normalize all entities in the specified entity list to a new map of entities.
     * @param entities Entity list.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the map of normalized entities.
     */
    normalizeAsMap(entities: Entity[], alias?: boolean, unsafe?: boolean, unroll?: boolean): Types.Map<Entity>;
}
