/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import { PropertyDecorator, ClassDecorator, Constructor } from './types';
import { Entity } from './entity';
import { Virtual } from './virtual';
import { Column } from './column';
import { Map } from './map';
/**
 * Schema helper class.
 */
export declare class Schema extends Class.Null {
    /**
     * Map of entity storages.
     */
    private static storages;
    /**
     * Sets the column format for the specified entity prototype.
     * @param column Column schema.
     * @param prototype Entity prototype.
     * @param property Entity property
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
     * Register a virtual column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local column name.
     * @returns Returns the join schema.
     */
    private static registerVirtual;
    /**
     * Register a column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @returns Returns the column schema.
     */
    private static registerColumn;
    /**
     * Resolves the column schema dependencies to be used externally.
     * @param column Column schema.
     * @returns Returns the prepared column schema.
     */
    private static resolveColumn;
    /**
     * Gets the row schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the row schema or undefined when the entity model does not exists.
     */
    static getRow<T extends Entity>(model: Constructor<T>): Map<Column> | undefined;
    /**
     * Gets the virtual columns schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the joined schema or undefined when the entity model does not exists.
     */
    static getVirtual<T extends Entity>(model: Constructor<T>): Map<Virtual> | undefined;
    /**
     * Gets the column schema for the specified entity model and column name.
     * @param model Entity model.
     * @param name Column name.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getColumn<T extends Entity>(model: Constructor<T>, name: string): Column | undefined;
    /**
     * Gets the primary column schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getPrimary<T extends Entity>(model: Constructor<T>): Column | undefined;
    /**
     * Gets the storage name for the specified entity model.
     * @param model Entity model.
     * @returns Returns the storage name or undefined when the entity does not exists.
     */
    static getStorage<T extends Entity>(model: Constructor<T>): string | undefined;
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
     * Decorates the specified property to be virtual column of a foreign entity.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name. (When omitted the primary ID column will be used as default)
     * @returns Returns the decorator method.
     */
    static Join(foreign: string, model: Constructor<Entity>, local: string): PropertyDecorator;
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
    static Array(model: Constructor, unique?: boolean, min?: number, max?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be an map column.
     * @param model Entity model.
     * @returns Returns the decorator method.
     */
    static Map(model: Constructor): PropertyDecorator;
    /**
     * Decorates the specified property to be an object column.
     * @param model Entity model.
     * @returns Returns the decorator method.
     */
    static Object(model: Constructor): PropertyDecorator;
}
