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
export declare class Mapper<Output extends Types.Entity, Input extends Types.Entity = Output, Options extends Types.Options = {}> extends Class.Null {
    /**
     * Data driver.
     */
    private driver;
    /**
     * Output entity model.
     */
    private output;
    /**
     * Input entity model.
     */
    private input;
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param output Output entity model.
     * @param input Input entity model.
     * @throws Throws an error when the model isn't a valid entity.
     */
    constructor(driver: Driver, output: Types.ModelClass<Output>, input?: Types.ModelClass<Output | Input>);
    /**
     * Insert the specified entity list into the storage using a custom model type.
     * @param model Model type.
     * @param entities Entity list.
     * @param options Insert options.
     * @returns Returns a promise to get the Id list of all inserted entities or undefined when an error occurs.
     */
    insertManyEx<E, R>(model: Types.ModelClass<E>, entities: E[], options?: Options): Promise<R[] | undefined>;
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @param options Insert options.
     * @returns Returns a promise to get the Id list of all inserted entities or undefined when an error occurs.
     */
    insertMany<E extends Input, R>(entities: E[], options?: Options): Promise<R[] | undefined>;
    /**
     * Insert the specified entity into the storage using a custom model type.
     * @param model Model type.
     * @param entity Entity data.
     * @param options Insert options.
     * @returns Returns a promise to get the Id of the inserted entry or undefined when an error occurs.
     */
    insertEx<E, R>(model: Types.ModelClass<E>, entity: E, options?: Options): Promise<R | undefined>;
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @param options Insert options.
     * @returns Returns a promise to get the Id of the inserted entity or undefined when an error occurs.
     */
    insert<E extends Input, R>(entity: E, options?: Options): Promise<R | undefined>;
    /**
     * Find all corresponding entity in the storage.
     * @param query Query filter
     * @param select Fields to select.
     * @param options Find options.
     * @returns Returns a promise to get the list of entities found or undefined when an error occurs.
     */
    find(query: Filters.Query, select?: string[], options?: Options): Promise<Output[] | undefined>;
    /**
     * Find the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param select Fields to select.
     * @param options Find options.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    findById<I>(id: I, select?: string[], options?: Options): Promise<Output | undefined>;
    /**
     * Gets the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param select Fields to select.
     * @param options Find options.
     * @returns Returns a promise to get the entity.
     * @throws Throws an error when the entity wasn't found.
     */
    getById<I>(id: I, select?: string[], options?: Options): Promise<Output>;
    /**
     * Update all entities that corresponds to the specified match using a custom model type.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the number of updated entities or undefined when an error occurs.
     */
    updateEx<E>(model: Types.ModelClass<E>, match: Filters.Match, entity: E, options?: Options): Promise<number | undefined>;
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the number of updated entities.
     */
    update<E extends Partial<Input>>(match: Filters.Match, entity: E, options?: Options): Promise<number | undefined>;
    /**
     * Update the entity that corresponds to the specified id using a custom model type.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the true when the entity was updated either undefined when an error occurs or false otherwise.
     */
    updateByIdEx<E, I>(model: Types.ModelClass<E>, id: I, entity: E, options?: Options): Promise<boolean | undefined>;
    /**
     * Update the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the true when the entity was updated either undefined when an error occurs or false otherwise.
     */
    updateById<E extends Partial<Input>, I>(id: I, entity: E, options?: Options): Promise<boolean | undefined>;
    /**
     * Replace the entity that corresponds to the specified entity Id using a custom model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Replace options.
     * @returns Returns a promise to get the true when the entity was replaced either undefined when an error occurs or false otherwise.
     */
    replaceByIdEx<E, I>(model: Types.ModelClass<E>, id: I, entity: E, options?: Options): Promise<boolean | undefined>;
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Replace options.
     * @returns Returns a promise to get the true when the entity was replaced either undefined when an error occurs or false otherwise.
     */
    replaceById<E extends Input, I>(id: I, entity: E, options?: Options): Promise<boolean | undefined>;
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param options Delete options.
     * @return Returns a promise to get the number of deleted entities or undefined when an error occurs.
     */
    delete(match: Filters.Match, options?: Options): Promise<number | undefined>;
    /**
     * Delete the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param options Delete options.
     * @return Returns a promise to get the true when the entity was deleted either undefined when an error occurs or false otherwise.
     */
    deleteById<I>(id: I, options?: Options): Promise<boolean | undefined>;
    /**
     * Count all corresponding entities from the storage.
     * @param query Query filter.
     * @param options Count options.
     * @returns Returns a promise to get the total amount of found entities or undefined when an error occurs.
     */
    count(query: Filters.Query, options?: Options): Promise<number | undefined>;
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the normalized entity.
     */
    normalize<E extends Output>(entity: E, alias?: boolean, unsafe?: boolean, unroll?: boolean): E;
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entity list.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the list of normalized entities.
     */
    normalizeAll<E extends Output>(entities: E[], alias?: boolean, unsafe?: boolean, unroll?: boolean): E[];
    /**
     * Normalize all entities in the specified entity list to a new map of entities.
     * @param entities Entity list.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the map of normalized entities.
     */
    normalizeAsMap<E extends Output>(entities: E[], alias?: boolean, unsafe?: boolean, unroll?: boolean): Types.Map<E>;
}
