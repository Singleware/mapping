/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '../types';
/**
 * Inputer helper class.
 */
export declare class Inputer extends Class.Null {
    /**
     * Creates a new list based on the specified model type and entry list.
     * @param model Model type.
     * @param entries Entry list.
     * @param fields Fields to be included in the entity.
     * @param required Determines whether all required columns must be provided.
     * @param multiple Determines whether each value in the specified list can be a sub list.
     * @returns Returns the generated list.
     */
    private static createArrayEntity;
    /**
     * Create a new map based on the specified model type and entry map.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Fields to be included in the entity.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated map.
     */
    private static createMapEntity;
    /**
     * Creates a new entity value from the specified column schema and entry value.
     * @param model Model type.
     * @param schema Column schema.
     * @param entry Entry value.
     * @param fields Fields to be included in the entity (if the values is an entity).
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the entity value.
     * @throws Throws an error when the expected value should be an array or map but the given value is not.
     */
    private static createValue;
    /**
     * Creates a new entity based on the specified model type and entry.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Fields to be included in the entity.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated entity.
     * @throws Throws an error when required columns aren't supplied or read-only columns were set.
     */
    private static createEntity;
    /**
     * Creates a new entity based on the specified model type and entry value.
     * @param model Model type.
     * @param entry Entry value.
     * @returns Returns the generated entity.
     */
    static create<I extends Types.Entity, O>(model: Types.ModelClass<O>, entry: I): O;
    /**
     * Creates a new entity array based on the specified model type and entry list.
     * @param model Model type.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createArray<I extends Types.Entity, O>(model: Types.ModelClass<O>, entries: I[]): O[];
    /**
     * Create a new entity map based on the specified model type and entry map.
     * @param model Model type.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createMap<I extends Types.Entity, O>(model: Types.ModelClass<O>, entry: Types.Map<I>): Types.Map<O>;
    /**
     * Creates a new full entity based on the specified model type and entry value.
     * @param model Model type.
     * @param entry Entry value.
     * @returns Returns the generated entity.
     */
    static createFull<I extends Types.Entity, O>(model: Types.ModelClass<O>, data: I): O;
    /**
     * Creates a new full entity array based on the specified model type and entry list.
     * @param model Model type.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createFullArray<I extends Types.Entity, O>(model: Types.ModelClass<O>, entries: I[]): O[];
    /**
     * Create a new full entity map based on the specified model type and entry map.
     * @param model Model type.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createFullMap<I extends Types.Entity, O>(model: Types.ModelClass<O>, entry: Types.Map<I>): Types.Map<O>;
}
