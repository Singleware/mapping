/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '../types';
/**
 * Normalizer helper class.
 */
export declare class Normalizer extends Class.Null {
    /**
     * Creates a new normalized entry array based on the specified model type and entity list.
     * @param model Model type.
     * @param entities Entity list.
     * @param multiple Determines whether each value in the specified list is a sub list.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated entry array.
     */
    private static createArray;
    /**
     * Creates a new normalized entry map based on the specified model type and entity map.
     * @param model Model type.
     * @param entity Entity map.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated entry map.
     */
    private static createMap;
    /**
     * Creates a new normalized entry from the specified column schema and entity value.
     * @param model Model type.
     * @param schema Column schema.
     * @param entity Entity value.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the normalized entry or the provided entity value.
     */
    private static createValue;
    /**
     * Creates a new normalized entry based on the specified model type and entity value.
     * @param model Model type.
     * @param entity Entity value.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated entry.
     */
    static create<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<I>, entity: I, aliased: boolean, unsafe: boolean): O;
}
