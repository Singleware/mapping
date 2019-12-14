/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '../types';
/**
 * Outputer helper class.
 */
export declare class Outputer extends Class.Null {
    /**
     * Creates a new list based on the specified model type, entry list and viewed fields.
     * @param model Model type.
     * @param entries Entry list.
     * @param multiple Determines whether each value in the specified list can be a sub list.
     * @param required Determines whether all required columns must be provided.
     * @param fields Viewed fields.
     * @returns Returns the generated list.
     */
    private static createArrayEntity;
    /**
     * Create a new entity map based on the specified model type, entry map and viewed fields.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Viewed fields.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated entity map.
     */
    private static createMapEntity;
    /**
     * Creates a new entry value from the specified column schema, entity value and viewed fields.
     * @param model Model type.
     * @param schema Column schema.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the original or the converted value.
     * @throws Throws an error when the expected value should be an array or map but the given value is not.
     */
    private static createValue;
    /**
     * Creates a new entity based on the specified model type, entry value and viewed fields.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @param required Determines whether all required columns must be provided.
     * @param wanted Determines whether all columns are wanted by the parent entity.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when required columns aren't supplied or write-only columns were set.
     */
    private static createEntity;
    /**
     * Creates a new entity based on the specified model type, entry value and viewed fields.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static create<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entry: I, fields: string[]): O | undefined;
    /**
     * Creates a new entity array based on the specified model type, entry list and viewed fields.
     * @param model Model type.
     * @param entries Entry list.
     * @param fields Viewed fields.
     * @returns Returns the generated entity array.
     */
    static createArray<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entries: I[], fields: string[]): O[];
    /**
     * Create a new entity map based on the specified model type, entry map and viewed fields.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Viewed fields.
     * @returns Returns the generated entity map.
     */
    static createMap<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entry: Types.Map<I>, fields: string[]): Types.Map<O>;
    /**
     * Creates a new full entity based on the specified model type, entry value and viewed fields.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static createFull<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entry: I, fields: string[]): O | undefined;
    /**
     * Creates a new full entity array based on the specified model type, entry list and viewed fields.
     * @param model Model type.
     * @param entries Entry list.
     * @param fields Viewed fields.
     * @returns Returns the generated entity array.
     */
    static createFullArray<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entries: I[], fields: string[]): O[];
    /**
     * Create a new full entity map based on the specified model type, entry map and viewed fields.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Viewed fields.
     * @returns Returns the generated entity map.
     */
    static createFullMap<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entry: Types.Map<I>, fields: string[]): Types.Map<O>;
}
