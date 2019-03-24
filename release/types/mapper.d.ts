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
     * Creates a new input entity based on the specified model type, view modes and the input data.
     * @param model Model type.
     * @param views View modes.
     * @param data Input data.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated entity.
     * @throws Throws an error when some required column was not supplied or some read-only property was set.
     */
    private static createInputEntity;
    /**
     * Creates a new output entity based on the specified model type, view modes and the output data.
     * @param model Model type.
     * @param views View modes.
     * @param data Output data.
     * @param full Determines whether all required properties must be provided.
     * @param wanted Determines whether all properties are wanted by the upper entity.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when some required column was not supplied or some write-only property was set.
     */
    private static createOutputEntity;
    /**
     * Creates a new list of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @param multiple Determines whether the each value from the specified list is another list or not.
     * @returns Returns the new generated list of entities.
     */
    private static createEntityArray;
    /**
     * Create a new map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated map of entities.
     */
    private static createEntityMap;
    /**
     * Converts the specified value into an entity when possible.
     * @param views View modes.
     * @param schema Column schema.
     * @param value Value to be converted.
     * @param input Determines whether the value will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the original or the converted value.
     */
    private static castValue;
    /**
     * Generates a new normalized list of data based on the specified model type and list of entities.
     * @param model Model type.
     * @param list List od entities.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new normalized list of data.
     */
    private static normalizeArray;
    /**
     * Generates a new normalized map of data based on the specified model type and map of entities.
     * @param model Model type.
     * @param map Map of entities.
     * @returns Returns the new normalized map of data.
     */
    private static normalizeMap;
    /**
     * Generates a new normalized value from the specified value and column schema.
     * @param column Column schema.
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
     * Determines whether the specified value is empty or not.
     * @param value Value to be checked.
     * @returns Returns true when the specified value is empty or false otherwise.
     */
    static isEmpty(value: any): boolean;
    /**
     * Creates a new entity based on the current model type, view mode and input data.
     * @param data Input data.
     * @param views View modes.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated entity or undefined when the entity is empty.
     */
    private createEntity;
    /**
     * Creates a new list of entities based on the specified model type, view mode and data list.
     * @param list Data list.
     * @param views View modes.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated list of entities or undefined when the list is empty.
     */
    private createEntityArray;
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
     * @param entities Entity list.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    protected insertMany(entities: E[], views?: string[]): Promise<any[]>;
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id of inserted entry.
     */
    protected insert(entity: E, views?: string[]): Promise<any>;
    /**
     * Find all corresponding entity in the storage.
     * @param filter Field filter.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the list of entities found.
     */
    protected find(filter: Statements.Filter, views?: string[]): Promise<E[]>;
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    protected findById(id: any, views?: string[]): Promise<E | undefined>;
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching fields.
     * @param entity Entity data to be updated.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the number of updated entities.
     */
    protected update(match: Statements.Match, entity: Types.Entity, views?: string[]): Promise<number>;
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    protected updateById(id: any, entity: Types.Entity, views?: string[]): Promise<boolean>;
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching fields.
     * @return Returns a promise to get the number of deleted entities.
     */
    protected delete(match: Statements.Match): Promise<number>;
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    protected deleteById(id: any): Promise<boolean>;
    /**
     * Count all corresponding entities from the storage.
     * @param filter Field filter.
     * @param views View modes.
     * @returns Returns a promise to get the total of found entities.
     */
    protected count(filter: Statements.Filter, views?: string[]): Promise<number>;
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     * @throws Throws an error when the model is a not valid entity.
     */
    constructor(driver: Driver, model: Types.Model<E>);
}
