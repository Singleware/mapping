/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '../types';
import { Base } from './base';
import { Real } from './real';
import { Virtual } from './virtual';
/**
 * Columns helper class.
 */
export declare class Helper extends Class.Null {
    /**
     * Gets the column name from the specified column schema.
     * @param schema Column schema.
     * @returns Returns the column name.
     */
    static getName<E extends Types.Entity>(schema: Base<E>): string;
    /**
     * Get a new path based on the specified column schemas.
     * @param schemas Column schemas.
     * @returns Returns a new path generated from the column schemas.
     */
    static getPath(schemas: Base[]): string;
    /**
     * Get all nested fields from the given column schema and the field list.
     * @param schema Column schema.
     * @param fields Fields to be selected.
     * @returns Returns a new field list containing all nested fields.
     */
    static getNestedFields<E extends Types.Entity>(schema: Base<E>, fields: string[]): string[];
    /**
     * Determines whether or not the specified column is a real column.
     * @param column Column object.
     * @returns Returns true when the column is a real column, false otherwise.
     */
    static isReal<E extends Types.Entity>(column: Base<E>): column is Real<E>;
    /**
     * Determines whether or not the specified column is a virtual column.
     * @param column Column object.
     * @returns Returns true when the column is a virtual column, false otherwise.
     */
    static isVirtual<E extends Types.Entity>(column: Base<E>): column is Virtual<E>;
    /**
     * Determines whether or not the specified column is visible based on the given fields.
     * @param schema Column schema.
     * @param fields Visible fields.
     * @returns Returns true when the column is visible, false otherwise.
     */
    static isVisible<E extends Types.Entity>(schema: Base<E>, ...fields: string[]): boolean;
}
