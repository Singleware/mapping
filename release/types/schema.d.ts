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
     * Assign all properties into the storage that corresponds to the specified entity type.
     * @param type Entity type.
     * @param properties Storage properties.
     * @returns Returns the assigned storage object.
     */
    private static assignStorage;
    /**
     * Assign all properties into the real column schema that corresponds to the specified entity type an column name.
     * @param type Entity type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     */
    private static assignRealColumn;
    /**
     * Assign all properties into the virtual column schema that corresponds to the specified entity type an column name.
     * @param type Entity type.
     * @param name Column name.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local column name.
     * @param filter Column filter.
     * @returns Returns the created column schema.
     */
    private static assignVirtualColumn;
    /**
     * Assign all properties into a real or virtual column schema that corresponds to the specified entity type an column name.
     * @param type Entity type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     */
    private static assignRealOrVirtualColumn;
    /**
     * Determines whether the specified model is a valid entity.
     * @param model Entity model.
     * @returns Returns true when the specified model is a valid entity, false otherwise.
     */
    static isEntity(model: Types.Model): boolean;
    /**
     * Determines whether one view in the given view list exists in the specified column schema.
     * @param views List of views.
     * @param column Column base schema.
     * @returns Returns true when the view is valid or false otherwise.
     */
    static isView(column: Columns.Base, ...views: string[]): boolean;
    /**
     * Gets the real row schema from the specified entity model and list of view modes.
     * @param model Entity model.
     * @param views List of view modes.
     * @returns Returns the row schema or undefined when the entity model does not exists.
     * @throws Throws an error when the entity model isn't valid.
     */
    static getRealRow(model: Types.Model, ...views: string[]): Columns.RealRow;
    /**
     * Gets the virtual row schema from the specified entity model and list of view modes.
     * @param model Entity model.
     * @param views List of view modes.
     * @returns Returns the joined schema or undefined when the entity model does not exists.
     * @throws Throws an error when the entity model isn't valid.
     */
    static getVirtualRow(model: Types.Model, ...views: string[]): Columns.VirtualRow;
    /**
     * Gets the joint row schema from the specified entity model and list of view modes.
     * @param model Entity model.
     * @param views List of view modes.
     * @returns Returns the virtual columns list.
     */
    static getJointRow(model: Types.Model, ...views: string[]): Columns.JointRow;
    /**
     * Gets the real column schema from the specified entity model and column name.
     * @param model Entity model.
     * @param name Column name.
     * @returns Returns the column schema or undefined when the column does not exists.
     * @throws Throws an error when the entity model isn't valid or the specified column was not found.
     */
    static getRealColumn(model: Types.Model, name: string): Columns.Real;
    /**
     * Gets the primary column schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the column schema or undefined when the column does not exists.
     * @throws Throws an error when the entity model isn't valid or the primary column was not defined
     */
    static getPrimaryColumn(model: Types.Model): Columns.Real;
    /**
     * Gets the storage name from the specified entity model.
     * @param model Entity model.
     * @returns Returns the storage name or undefined when the entity does not exists.
     * @throws Throws an error when the entity model isn't valid.
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
     * Decorates the specified property to be visible only in specific scenarios.
     * @param views List of views.
     * @returns Returns the decorator method.
     */
    static Views(...views: RegExp[]): PropertyDecorator;
    /**
     * Decorates the specified property to convert its input and output values.
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
     * Decorates the specified property to be virtual column of a foreign entity.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name.
     * @param filter Column filter.
     * @returns Returns the decorator method.
     */
    static Join(foreign: string, model: Types.Model, local: string, filter?: Statements.Filter): PropertyDecorator;
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
     * Decorates the specified property to be a enumeration column.
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
     * Decorates the specified property to be an map column.
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
