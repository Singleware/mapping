/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '../types';
/**
 * Array values alias.
 */
declare type Arrays<T> = (T | T[])[];
/**
 * Outputer helper class.
 */
export declare class Outputer extends Class.Null {
    /**
     * Determines whether the specified value is an empty result or not.
     * @param value Value to check.
     * @returns Returns true when the specified value is empty, false otherwise.
     */
    private static isEmptyResult;
    /**
     * Creates a new entity array based on the specified model type, viewed fields and entry list.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entries Entry list.
     * @param required Determines whether all required columns must be provided.
     * @param multiple Determines whether each value from the specified list is another list.
     * @returns Returns the generated entity array.
     */
    private static createArrayEntity;
    /**
     * Create a new entity map based on the specified model type, viewed fields and entry map.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry map.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated entity map.
     */
    private static createMapEntity;
    /**
     * Converts if possible the specified entry to an entity.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param schema Column schema.
     * @param entry Entry value.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the original or the converted value.
     * @throws Throws an error when the expected value should be an array or map but the given value is not.
     */
    private static createValue;
    /**
     * Creates a new entity based on the specified model type, viewed fields and entry.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry value.
     * @param required Determines whether all required columns must be provided.
     * @param wanted Determines whether all columns are wanted by the parent entity.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when required columns aren't supplied or write-only columns were set.
     */
    private static createEntity;
    /**
     * Creates a new entity based on the specified model type, viewed fields and entry value.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry value.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static create<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, fields: string[], entry: I): O | undefined;
    /**
     * Creates a new entity array based on the specified model type, viewed fields and entry list.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, fields: string[], entries: Arrays<I>): Arrays<O>;
    /**
     * Create a new entity map based on the specified model type, viewed fields and entry map.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, fields: string[], entry: Types.Map<I>): Types.Map<O>;
    /**
     * Creates a new full entity based on the specified model type, viewed fields and entry value.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry value.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static createFull<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, fields: string[], entry: I): O | undefined;
    /**
     * Creates a new full entity array based on the specified model type, viewed fields and entry list.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createFullArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], entries: Arrays<I>): Arrays<O>;
    /**
     * Create a new full entity map based on the specified model type, viewed fields and entry map.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createFullMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, fields: string[], map: Types.Map<I>): Types.Map<O>;
}
export {};
