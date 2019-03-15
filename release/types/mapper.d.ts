import * as Class from '@singleware/class';
import * as Types from './types';
import * as Statements from './statements';
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
     * Creates a new entity based on the specified model type, view mode and input data.
     * @param model Model type.
     * @param view View mode.
     * @param data Input data.
     * @param input Determines whether data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated entity based on the model type.
     * @throws Throws an error when some required column was not supplied or some read-only/write-only property was set wrongly.
     */
    private static createEntity;
    /**
     * Creates a new list of entities based on the specified model type, view mode and the list of data.
     * @param model Model type.
     * @param view View mode.
     * @param list List of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated list of entities based on the model type.
     */
    private static createEntityArray;
    /**
     * Create a new map of entities based on the specified model type, view mode and map of data.
     * @param model Model type.
     * @param view View mode.
     * @param map Map of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated map of entities based on the model type.
     */
    private static createEntityMap;
    /**
     * Check whether the specified value can be converted to an entity.
     * @param real Real column schema.
     * @param view View mode.
     * @param value Value to be converted.
     * @param input Determines whether the value will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the original or the converted value.
     */
    private static castValue;
    /**
     * Generates a new normalized array of entities data based on the specified model type and input values.
     * @param model Model type.
     * @param values Entities list.
     * @returns Returns the new normalized list of entities.
     */
    private static normalizeArray;
    /**
     * Generates a new normalized map of entities data based on the specified model type and value.
     * @param model Model type.
     * @param value Entity map.
     * @returns Returns the new normalized map of entities.
     */
    private static normalizeMap;
    /**
     * Generates a new normalized value from the specified real column schema and value.
     * @param real Real column schema.
     * @param value Value to be normalized.
     * @returns Returns the new normalized value.
     */
    private static normalizeValue;
    /**
     * Generates a new normalized entity data based on the specified model type and input data.
     * @param model Model type.
     * @param input Input data.
     * @returns Returns the new normalized entity data.
     */
    static normalize(model: Types.Model, input: Types.Entity): Types.Entity;
    /**
     * Creates a new entity based on the current model type, view mode and input data.
     * @param view View mode.
     * @param data Input data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated entity.
     */
    private createEntity;
    /**
     * Assign to the given target all virtual columns joined into the specified source.
     * @param view View mode.
     * @param target Target data.
     * @param source Source entity.
     * @returns Returns the specified target data.
     */
    private assignVirtualColumns;
    /**
     * Generate a new normalized entity based on the specified input data.
     * @param input Input data.
     * @returns Returns the new normalized entity data.
     */
    protected normalize(input: Types.Entity): Types.Entity;
    /**
     * Normalize all entities in the specified input list.
     * @param list Input list.
     * @returns Returns the list of normalized entities.
     */
    protected normalizeAll(...list: Types.Entity[]): Types.Entity[];
    /**
     * Normalize all entities in the specified input list to a map of entities.
     * @param list Input list.
     * @returns Returns the map of normalized entities.
     */
    protected normalizeAsMap(...list: Types.Entity[]): Types.Entity;
    /**
     * Insert the specified entity list into the storage.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    protected insertMany(view: string, entities: E[]): Promise<any[]>;
    /**
     * Insert the specified entity into the storage.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of inserted entry.
     */
    protected insert(view: string, entity: E): Promise<any>;
    /**
     * Find the corresponding entity in the storage.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param filter Field filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns a promise to get the list of entities found.
     */
    protected find(view: string, filter: Statements.Filter, sort?: Statements.Sort, limit?: Statements.Limit): Promise<E[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param id Entity id.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    protected findById(view: string, id: any): Promise<E | undefined>;
    /**
     * Update all entities that corresponds to the specified filter.
     * @param view Entity view.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    protected update(view: string, filter: Statements.Filter, entity: Types.Entity): Promise<number>;
    /**
     * Update a entity that corresponds to the specified id.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    protected updateById(view: string, id: any, entity: Types.Entity): Promise<boolean>;
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
