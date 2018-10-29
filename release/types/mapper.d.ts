import { Constructor } from './types';
import { Driver } from './driver';
import { Entity } from './entity';
import { Expression } from './expression';
/**
 * Generic data mapper class.
 */
export declare class Mapper<E extends Entity> {
    /**
     * List of common types.
     */
    private static commons;
    /**
     * Data driver.
     */
    private driver;
    /**
     * Entity model.
     */
    private model;
    /**
     * Gets the primary column name.
     * @returns Returns the primary column name.
     * @throws Throws an error when there is no primary column defined.
     */
    private getPrimaryName;
    /**
     * Gets the virtual columns list.
     * @returns Returns the virtual columns list.
     */
    private getAggregations;
    /**
     * Assign virtual columns into the specified data based on the given entity.
     * @param data Target entity data.
     * @param entity Source entity.
     * @returns Returns the specified entity data.
     */
    private assignVirtual;
    /**
     * Creates a new model data based on the specified entity data.
     * @param entity Entity data.
     * @param input Determines whether the entity will be used for an input or output.
     * @param all Determines if all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied.
     */
    private createModel;
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @returns Returns the new normalized entity data.
     */
    protected normalize(entity: Entity): Entity;
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entities list.
     * @returns Returns the list of normalized entities.
     */
    protected normalizeAll(...entities: Entity[]): Entity[];
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    protected insertMany(entities: E[]): Promise<any[]>;
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of inserted entry.
     */
    protected insert(entity: E): Promise<any>;
    /**
     * Find the corresponding entity in the storage.
     * @param filter Filter expression.
     * @returns Returns a promise to get the list of entities found.
     */
    protected find(filter: Expression): Promise<E[]>;
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
    protected update(filter: Expression, entity: Entity): Promise<number>;
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    protected updateById(id: any, entity: Entity): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param filter Filter columns.
     * @return Returns a promise to get the number of deleted entities.
     */
    protected delete(filter: Expression): Promise<number>;
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
    constructor(driver: Driver, model: Constructor<E>);
    /**
     * Determines whether the specified entity type common or not.
     * @param type Entity type.
     * @returns Returns true when the specified entity is common, false otherwise.
     */
    private static isCommon;
    /**
     * Gets the column name from the specified column schema.
     * @param column Column schema.
     * @returns Returns the column name.
     */
    private static getColumnName;
    /**
     * Creates a new array of model data based on the specified entity model and values.
     * @param model Entity model.
     * @param values Entities list.
     * @param input Determines whether the entity will be used for an input or output.
     * @param all Determines if all required properties must be provided.
     * @returns Returns the new generated list of entities based on entity model.
     */
    private static createArrayModel;
    /**
     * Creates a new map of model data based on the specified entity model and value.
     * @param model Entity model.
     * @param value Entity map.
     * @param input Determines whether the entity will be used for an input or output.
     * @param all Determines if all required properties must be provided.
     * @returns Returns the new generated map of entity data based on entity model.
     */
    private static createMapModel;
    /**
     * Creates a new model value based on the specified entity model and data.
     * @param column Column schema.
     * @param value Value to be created.
     * @param input Determines whether the entity will be used for an input or output.
     * @param all Determines if all required properties must be provided.
     * @returns Returns the new normalized value.
     */
    private static createValueModel;
    /**
     * Creates a new model data based on the specified entity model and data.
     * @param model Entity model.
     * @param data Entity data.
     * @param input Determines whether the entity will be used for an input or output.
     * @param all Determines if all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied.
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
    protected static normalize(model: Constructor<Entity>, entity: Entity): Entity;
}
