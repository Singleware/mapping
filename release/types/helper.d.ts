import * as Class from '@singleware/class';
import * as Types from './types';
/**
 * Helper class.
 */
export declare class Helper extends Class.Null {
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
     * @param wanted Determines whether all properties are wanted by the parent entity.
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
     * @param multiple Determines whether each value from the specified list is another list or not.
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
     * Converts the specified value to an entity when possible.
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
}
