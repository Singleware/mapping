/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from './types';
import * as Columns from './columns';
import { Statements } from '.';
/**
 * Schema helper class.
 */
export declare class Schema extends Class.Null {
    /**
     * Map of entity storages.
     */
    private static storages;
    /**
     * Adds the specified format validation into the provided column schema and property descriptor.
     * @param scope Entity scope.
     * @param column Column schema.
     * @param validator Data validator.
     * @param format Data format.
     * @param descriptor Property descriptor.
     * @returns Returns the wrapped property descriptor.
     */
    private static addValidation;
    /**
     * Assign all properties into the storage that corresponds to the specified model type.
     * @param model Model type.
     * @param properties Storage properties.
     * @returns Returns the assigned storage object.
     */
    private static assignStorage;
    /**
     * Assign all properties into the column schema that corresponds to the specified model type and column name.
     * @param model Model type.
     * @param type Column type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     * @throws Throws an error when a column with the same name and another type already exists.
     */
    private static assignColumn;
    /**
     * Assign all properties into a real or virtual column schema that corresponds to the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     * @throws Throws an error when the column does not exists yet.
     */
    private static assignRealOrVirtualColumn;
    /**
     * Determines whether the specified model type is a valid entity.
     * @param model Model type.
     * @returns Returns true when the specified model is valid, false otherwise.
     */
    static isEntity<E extends Types.Entity>(model: Types.Model<E>): boolean;
    /**
     * Determines whether the specified column schema can be viewed based on the given fields.
     * @param column Column schema.
     * @param fields Fields to be selected.
     * @returns Returns true when the view is valid or false otherwise.
     */
    static isViewed<E extends Types.Entity>(column: Columns.Base<E>, ...fields: string[]): boolean;
    /**
     * Gets the real row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the real row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static getRealRow(model: Types.Model, ...fields: string[]): Columns.RealRow;
    /**
     * Gets the virtual row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the virtual row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static getVirtualRow(model: Types.Model, ...fields: string[]): Columns.VirtualRow;
    /**
     * Gets the real column schema from the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @returns Returns the real column schema.
     * @throws Throws an error when the model type isn't valid or the specified column was not found.
     */
    static getRealColumn<E extends Types.Entity>(model: Types.Model<E>, name: string): Columns.Real<E>;
    /**
     * Gets the primary column schema from the specified model type.
     * @param model Model type.
     * @returns Returns the column schema or undefined when the column does not exists.
     * @throws Throws an error when the entity model isn't valid or the primary column was not defined
     */
    static getPrimaryColumn<E extends Types.Entity>(model: Types.Model<E>): Columns.Real<E>;
    /**
     * Gets the storage name from the specified model type.
     * @param model Model type.
     * @returns Returns the storage name.
     * @throws Throws an error when the model type isn't valid.
     */
    static getStorage(model: Types.Model): string;
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
     * Decorates the specified property to convert its input and output value.
     * @param callback Converter callback.
     * @returns Returns the decorator method.
     */
    static Convert(callback: Types.Converter): PropertyDecorator;
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
     * @throws Throws an error when the column is already write-only.
     */
    static ReadOnly(): PropertyDecorator;
    /**
     * Decorates the specified property to be a write-only column.
     * @returns Returns the decorator method.
     * @throws Throws an error when the column is already read-only.
     */
    static WriteOnly(): PropertyDecorator;
    /**
     * Decorates the specified property to be a virtual column of a foreign entity.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name.
     * @param match Column match.
     * @returns Returns the decorator method.
     */
    static Join<E extends Types.Entity>(foreign: string, model: Types.Model<E>, local: string, match?: Statements.Match): PropertyDecorator;
    /**
     * Decorates the specified property to be a virtual column of a foreign entity list.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name.
     * @param filter Column filter.
     * @returns Returns the decorator method.
     */
    static JoinAll<E extends Types.Entity>(foreign: string, model: Types.Model<E>, local: string, filter?: Statements.Filter): PropertyDecorator;
    /**
     * Decorates the specified property to be a primary column.
     * @returns Returns the decorator method.
     */
    static Primary(): PropertyDecorator;
    /**
     * Decorates the specified property to be an Id column.
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
     * Decorates the specified property to be an integer column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Integer(minimum?: number, maximum?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a decimal column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Decimal(minimum?: number, maximum?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a number column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Number(minimum?: number, maximum?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a string column.
     * @param minimum Minimum length.
     * @param maximum Maximum length.
     * @returns Returns the decorator method.
     */
    static String(minimum?: number, maximum?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be an enumeration column.
     * @param values Enumeration values.
     * @returns Returns the decorator method.
     */
    static Enumeration(...values: string[]): PropertyDecorator;
    /**
     * Decorates the specified property to be a string pattern column.
     * @param pattern Pattern expression.
     * @param name Pattern name.
     * @returns Returns the decorator method.
     */
    static Pattern(pattern: RegExp, name?: string): PropertyDecorator;
    /**
     * Decorates the specified property to be a timestamp column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static Timestamp(min?: Date, max?: Date): PropertyDecorator;
    /**
     * Decorates the specified property to be a date column.
     * @param minimum Minimum date.
     * @param maximum Maximum date.
     * @returns Returns the decorator method.
     */
    static Date(minimum?: Date, maximum?: Date): PropertyDecorator;
    /**
     * Decorates the specified property to be an array column.
     * @param model Model type.
     * @param unique Determines whether the items of array must be unique or not.
     * @param minimum Minimum items.
     * @param maximum Maximum items.
     * @returns Returns the decorator method.
     */
    static Array(model: Types.Model, unique?: boolean, minimum?: number, maximum?: number): PropertyDecorator;
    /**
     * Decorates the specified property to be a map column.
     * @param model Model type.
     * @returns Returns the decorator method.
     */
    static Map(model: Types.Model): PropertyDecorator;
    /**
     * Decorates the specified property to be an object column.
     * @param model Model type.
     * @returns Returns the decorator method.
     */
    static Object(model: Types.Model): PropertyDecorator;
}
