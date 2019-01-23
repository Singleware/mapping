/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from './types';
import * as Columns from './columns';
/**
 * Schema helper class.
 */
export declare class Schema extends Class.Null {
    /**
     * Map of entity storages.
     */
    private static storages;
    /**
     * Sets the column validation format for the specified entity prototype.
     * @param column Column schema.
     * @param prototype Entity prototype.
     * @param property Entity property.
     * @param descriptor Entity descriptor.
     * @returns Returns the wrapped descriptor.
     */
    private static setFormat;
    /**
     * Sets a storage for the specified entity type.
     * @param type Entity type.
     * @returns Returns the entity type.
     */
    private static setStorage;
    /**
     * Set a real column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @param format Column data format.
     * @returns Returns the column schema.
     */
    private static setReal;
    /**
     * Set a virtual column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local column name.
     * @returns Returns the join schema.
     */
    private static setVirtual;
    /**
     * Resolve any dependency in the specified real column schema to be used externally.
     * @param column Column schema.
     * @returns Returns the resolved column schema.
     */
    private static resolveRealColumn;
    /**
     * Gets the real row schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the row schema or undefined when the entity model does not exists.
     */
    static getRealRow<T extends Types.Entity>(model: Types.Model<T>): Columns.RealRow | undefined;
    /**
     * Gets the virtual row schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the joined schema or undefined when the entity model does not exists.
     */
    static getVirtualRow<T extends Types.Entity>(model: Types.Model<T>): Columns.VirtualRow | undefined;
    /**
     * Gets the real column schema from the specified entity model and column name.
     * @param model Entity model.
     * @param name Column name.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getRealColumn<T extends Types.Entity>(model: Types.Model<T>, name: string): Columns.Real | undefined;
    /**
     * Gets the real primary column schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getPrimaryColumn<T extends Types.Entity>(model: Types.Model<T>): Columns.Real | undefined;
    /**
     * Gets the storage name from the specified entity model.
     * @param model Entity model.
     * @returns Returns the storage name or undefined when the entity does not exists.
     */
    static getStorage<T extends Types.Entity>(model: Types.Model<T>): string | undefined;
    /**
     * Decorates the specified class to be an entity model.
     * @param name Storage name.
     * @returns Returns the decorator method.
     */
    static Entity(name: string): ClassDecorator;
    /**
     * Decorates the specified property to be referenced by another property name.
     * @param name Alias name.
     * @returns Returns the decorator method.
     */
    static Alias(name: string): PropertyDecorator;
    /**
     * Decorates the specified property to be a required column.
     * @returns Returns the decorator method.
     */
    static Required(): PropertyDecorator;
    /**
     * Decorates the specified property to be a hidden column.
     * @returns Returns the decorator method.
     */
    static Hidden(): PropertyDecorator;
    /**
     * Decorates the specified property to be a read-only column.
     * @returns Returns the decorator method.
     */
    static ReadOnly(): PropertyDecorator;
    /**
     * Decorates the specified property to be a write-only column.
     * @returns Returns the decorator method.
     */
    static WriteOnly(): PropertyDecorator;
    /**
     * Decorates the specified property to be virtual column of a foreign entity.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name. (When omitted the primary ID column will be used as default)
     * @returns Returns the decorator method.
     */
    static Join(foreign: string, model: Types.Model, local: string): PropertyDecorator;
    /**
     * Decorates the specified property to be a primary column.
     * @returns Returns the decorator method.
     */
    static Primary(): PropertyDecorator;
    /**
     * Decorates the specified property to be an id column.
     * @returns Returns the decorator method.
     */
    static Id(): PropertyDecorator;
    /**
     * Decorates the specified property to be a column that accepts null values.
     * @returns Returns the decorator method.
     */
    static Null(): PropertyDecorator;
    /**
     * Decorates the specified property to be a binary column.
     * @returns Returns the decorator method.
     */
    static Binary(): PropertyDecorator;
    /**
     * Decorates the specified property to be a boolean column.
     * @returns Returns the decorator method.
     */
    static Boolean(): PropertyDecorator;
    /**
     * Decorates the specified property to be a integer column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Integer(min?: number, max?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a decimal column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Decimal(min?: number, max?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a number column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Number(min?: number, max?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a string column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static String(min?: number, max?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a enumeration column.
     * @param values Enumeration values.
     * @returns Returns the decorator method.
     */
    static Enumeration(...values: string[]): PropertyDecorator;
    /**
     * Decorates the specified property to be a string pattern column.
     * @param pattern Pattern expression.
     * @param alias Pattern alias name.
     * @returns Returns the decorator method.
     */
    static Pattern(pattern: RegExp, alias?: string): PropertyDecorator;
    /**
     * Decorates the specified property to be a timestamp column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static Timestamp(min?: Date, max?: Date): PropertyDecorator;
    /**
     * Decorates the specified property to be a date column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static Date(min?: Date, max?: Date): PropertyDecorator;
    /**
     * Decorates the specified property to be an array column.
     * @param model Entity model.
     * @param unique Determines whether the array items must be unique or not.
     * @param min Minimum items.
     * @param max Maximum items.
     * @returns Returns the decorator method.
     */
    static Array(model: Types.Model, unique?: boolean, min?: number, max?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be an map column.
     * @param model Entity model.
     * @returns Returns the decorator method.
     */
    static Map(model: Types.Model): PropertyDecorator;
    /**
     * Decorates the specified property to be an object column.
     * @param model Entity model.
     * @returns Returns the decorator method.
     */
    static Object(model: Types.Model): PropertyDecorator;
}
