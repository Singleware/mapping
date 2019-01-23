/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from './types';
import * as Statements from './statements';
import { Driver } from './driver';
/**
 * Generic data mapper class.
 */
export declare class Mapper<E extends Types.Entity> extends Class.Null {
    /**
     * Data driver.
     */
    private driver;
    /**
     * Entity model.
     */
    private model;
    /**
     * List of common types.
     */
    private static commons;
    /**
     * Creates and get a new array of data model based on the specified entity model and values.
     * @param model Entity model.
     * @param values Entities list.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated list of entities based on entity model.
     */
    private static getArrayModel;
    /**
     * Creates and get a new map of data model based on the specified entity model and value.
     * @param model Entity model.
     * @param value Entity map.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines if all required properties must be provided.
     * @returns Returns the new generated map of entity data based on entity model.
     */
    private static getMapModel;
    /**
     * Creates and get a new model value based on the specified entity model and data.
     * @param column Column schema.
     * @param value Value to be created.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new normalized value.
     */
    private static getValueModel;
    /**
     * Creates a new data model based on the specified entity model and data.
     * @param model Entity model.
     * @param data Entity data.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied or some read-only/write-only property was set wrongly.
     */
    private static createModel;
    /**
     * Generates a new normalized array of entity data based on the specified entity model and values.
     * @param model Entity model.
     * @param values Entities list.
     * @returns Returns the new normalized list of entities.
     */
    private static normalizeArray;
    /**
     * Generates a new normalized map of entity data based on the specified entity model and value.
     * @param model Entity model.
     * @param value Entity map.
     * @returns Returns the new normalized map of entities.
     */
    private static normalizeMap;
    /**
     * Generates a new normalized value from the specified column schema and value.
     * @param column Column schema.
     * @param value Value to be normalized.
     * @returns Returns the new normalized value.
     */
    private static normalizeValue;
    /**
     * Generates a new normalized entity data based on the specified entity model and data.
     * @param model Entity model
     * @param entity Entity data.
     * @returns Returns the new normalized entity data.
     */
    protected static normalize(model: Types.Model, entity: Types.Entity): Types.Entity;
    /**
     * Gets the list of joined columns.
     * @returns Returns the virtual columns list.
     */
    private getJoinedColumns;
    /**
     * Assign all joined columns into the specified data model from the given entity.
     * @param data Target entity data.
     * @param entity Source entity.
     * @returns Returns the specified entity data.
     */
    private assignJoinedColumns;
    /**
     * Creates a new data model based on the specified entity data.
     * @param entity Entity data.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied.
     */
    private createModel;
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @returns Returns the new normalized entity data.
     */
    protected normalize(entity: Types.Entity): Types.Entity;
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entities list.
     * @returns Returns the list of normalized entities.
     */
    protected normalizeAll(...entities: Types.Entity[]): Types.Entity[];
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entities list.
     * @returns Returns the map of normalized entities.
     */
    protected normalizeAsMap(...entities: Types.Entity[]): Types.Entity;
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    protected insertMany(...entities: E[]): Promise<any[]>;
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of inserted entry.
     */
    protected insert(entity: E): Promise<any>;
    /**
     * Find the corresponding entity in the storage.
     * @param filters List of expression filters.
     * @returns Returns a promise to get the list of entities found.
     */
    protected find(...filters: Statements.Filter[]): Promise<E[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    protected findById(id: any): Promise<E | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    protected update(filter: Statements.Filter, entity: Types.Entity): Promise<number>;
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    protected updateById(id: any, entity: Types.Entity): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param filter Filter columns.
     * @return Returns a promise to get the number of deleted entities.
     */
    protected delete(filter: Statements.Filter): Promise<number>;
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    protected deleteById(id: any): Promise<boolean>;
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     * @throws Throws an error when the model is a not valid entity.
     */
    constructor(driver: Driver, model: Types.Model<E>);
}
