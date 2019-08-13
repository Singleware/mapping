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
export declare class Mapper<E extends Types.Entity> extends Class.Null {
    /**
     * Entity model.
     */
    private model;
    /**
     * Data driver.
     */
    private driver;
    /**
     * Insert the specified entity list into the storage using a custom model type.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    protected insertManyEx<T extends Types.Entity>(model: Types.Model<T>, entities: T[]): Promise<any[]>;
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    protected insertMany(entities: E[]): Promise<any[]>;
    /**
     * Insert the specified entity into the storage using a custom model type.
     * @param model Model type.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of the inserted entry.
     */
    protected insertEx<T extends Types.Entity>(model: Types.Model<T>, entity: T): Promise<any>;
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of the inserted entity.
     */
    protected insert(entity: E): Promise<any>;
    /**
     * Find all corresponding entity in the storage.
     * @param query Query filter
     * @param fields Viewed fields.
     * @returns Returns a promise to get the list of entities found.
     */
    protected find(query: Filters.Query, fields?: string[]): Promise<E[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    protected findById(id: any, fields?: string[]): Promise<E | undefined>;
    /**
     * Update all entities that corresponds to the specified match using a custom model type.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    protected updateEx<T extends Types.Entity>(model: Types.Model<T>, match: Filters.Match, entity: T): Promise<number>;
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    protected update(match: Filters.Match, entity: Types.Entity): Promise<number>;
    /**
     * Update the entity that corresponds to the specified id using a custom model type.
     * @param model Model type.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    protected updateByIdEx<T extends Types.Entity>(model: Types.Model<T>, id: any, entity: T): Promise<boolean>;
    /**
     * Update the entity that corresponds to the specified id.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    protected updateById(id: any, entity: Types.Entity): Promise<boolean>;
    /**
     * Replace the entity that corresponds to the specified id using a custom model type.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    protected replaceByIdEx<T extends Types.Entity>(model: Types.Model<T>, id: any, entity: Types.Entity): Promise<boolean>;
    /**
     * Replace the entity that corresponds to the specified id.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    protected replaceById(id: any, entity: Types.Entity): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @return Returns a promise to get the number of deleted entities.
     */
    protected delete(match: Filters.Match): Promise<number>;
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    protected deleteById(id: any): Promise<boolean>;
    /**
     * Count all corresponding entities from the storage.
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    protected count(query: Filters.Query): Promise<number>;
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @returns Returns the normalized entity.
     */
    protected normalize(entity: E, alias?: boolean, unsafe?: boolean, unroll?: boolean): E;
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entity list.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @returns Returns the list of normalized entities.
     */
    protected normalizeAll(entities: E[], alias?: boolean, unsafe?: boolean, unroll?: boolean): E[];
    /**
     * Normalize all entities in the specified entity list to a new map of entities.
     * @param entities Entity list.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @returns Returns the map of normalized entities.
     */
    protected normalizeAsMap(entities: E[], alias?: boolean, unsafe?: boolean, unroll?: boolean): E;
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     * @throws Throws an error when the model isn't a valid entity.
     */
    constructor(driver: Driver, model: Types.Model<E>);
}
