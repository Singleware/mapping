/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from './types';
/**
 * Type definition for array values accepted by entities.
 */
declare type ArrayValue<T> = (T | T[])[];
/**
 * Entity helper class.
 */
export declare class Entity extends Class.Null {
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
    static createOutputEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I, full: boolean, wanted: boolean): O | undefined;
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
     * Generates a new normalized list of data based on the specified model type and the list of entities.
     * @param model Model type.
     * @param list List of entities.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new normalized list of data.
     */
    private static normalizeArray;
    /**
     * Generates a new normalized map based on the specified model type and map of entities.
     * @param model Model type.
     * @param map Map of entities.
     * @returns Returns the new normalized map of data.
     */
    private static normalizeMap;
    /**
     * Generates a new normalized value from the specified column schema and input value.
     * @param column Column schema.
     * @param value Input value.
     * @returns Returns the new normalized value or the original value when it doesn't need to be normalized.
     */
    private static normalizeValue;
    /**
     * Creates a new array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new generated list of entities.
     */
    static createArrayEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>, input: boolean, full: boolean, multiple: boolean): ArrayValue<O>;
    /**
     * Create a new map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated map of entities.
     */
    static createMapEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>, input: boolean, full: boolean): Types.Map<O>;
    /**
     * Creates a new input entity based on the specified model type, view modes and the input data.
     * @param model Model type.
     * @param views View modes.
     * @param data Input data.
     * @returns Returns the generated entity.
     * @throws Throws an error when some required column was not supplied or some read-only property was set.
     */
    static createInput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I): O;
    /**
     * Creates a new full input entity based on the specified model type, view modes and the input data.
     * @param model Model type.
     * @param views View modes.
     * @param data Input data.
     * @returns Returns the generated entity.
     * @throws Throws an error when some required column was not supplied or some read-only property was set.
     */
    static createFullInput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I): O;
    /**
     * Creates a new output entity based on the specified model type, view modes and the output data.
     * @param model Model type.
     * @param views View modes.
     * @param data Output data.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when some required column was not supplied or some write-only property was set.
     */
    static createOutput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I): O | undefined;
    /**
     * Creates a new full output entity based on the specified model type, view modes and the output data.
     * @param model Model type.
     * @param views View modes.
     * @param data Output data.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when some required column was not supplied or some write-only property was set.
     */
    static createFullOutput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I): O | undefined;
    /**
     * Creates a new input array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createInputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>): ArrayValue<O>;
    /**
     * Creates a new full input array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createFullInputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>): ArrayValue<O>;
    /**
     * Creates a new output array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createOutputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>): ArrayValue<O>;
    /**
     * Creates a new full output array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createFullOutputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>): ArrayValue<O>;
    /**
     * Create a new input map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createInputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>): Types.Map<O>;
    /**
     * Create a new full input map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createFullInputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>): Types.Map<O>;
    /**
     * Create a new output map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createOutputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>): Types.Map<O>;
    /**
     * Create a new full output map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createFullOutputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>): Types.Map<O>;
    /**
     * Generates a new normalized entity based on the specified model type and input data.
     * @param model Model type.
     * @param data Input data.
     * @returns Returns the new normalized entity data.
     */
    static normalize<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<I>, data: I): O;
    /**
     * Determines whether the specified value is empty or not.
     * @param value Value to be checked.
     * @returns Returns true when the specified value is empty or false otherwise.
     */
    static isEmpty<E extends Types.Entity, T>(value: T | T[] | Types.Model<E>): boolean;
}
export {};
