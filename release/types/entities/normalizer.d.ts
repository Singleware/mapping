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
     * Creates a new normalized list based on the specified model type and entity list.
     * @param model Model type.
     * @param entities Entity list.
     * @param multiple Determines whether each value in the specified list can be a sub list.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated list.
     */
    private static createList;
    /**
     * Create a new normalized map based on the specified model type and entity map.
     * @param model Model type.
     * @param entity Entity map.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @param path Current path for unrolled values.
     * @param data Current data for unrolled values.
     * @returns Returns the generated map.
     */
    private static createMap;
    /**
     * Creates a new normalized value from the specified column schema and entity value.
     * @param model Model type.
     * @param schema Column schema.
     * @param entity Entity value.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @param path Current path for unrolled values.
     * @param data Current data for unrolled values.
     * @returns Returns the normalized value.
     * @throws Throws an error when the value isn't supported.
     */
    private static createValue;
    /**
     * Creates a new normalized entry based on the specified model type and entity value.
     * @param model Model type.
     * @param entity Entity value.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @param path Current path for unrolled values.
     * @param data Current data for unrolled values.
     * @returns Returns the generated entry.
     */
    private static createEntry;
    /**
     * Creates a new normalized object based on the specified model type and entity.
     * @param model Model type.
     * @param entity Entity object.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @returns Returns the generated object.
     */
    static create<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<I>, entity: I, alias?: boolean, unsafe?: boolean, unroll?: boolean): O;
}
