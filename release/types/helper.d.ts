/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from './types';
import * as Columns from './columns';
/**
 * Helper class.
 */
export declare class Helper extends Class.Null {
    /**
     * Try to get the resolved model class from the specified model input.
     * @param input Model input.
     * @returns Returns the resolved model class or undefined.
     */
    static tryEntityModel<E extends Types.Entity>(input: Types.ModelInput<E>): Types.ModelClass<E> | undefined;
    /**
     * Get the model class based on the specified model input.
     * @param input Model input.
     * @returns Returns the model class.
     * @throws Throws an error when the specified model input doesn't resolve to a model class.
     */
    static getEntityModel<E extends Types.Entity>(input: Types.ModelInput<E>): Types.ModelClass<E>;
    /**
     * Try to get a list column schemas based on the specified path.
     * @param model Entity model.
     * @param path Entity path.
     * @returns Returns the list of column schemas or undefined when the path isn't valid.
     */
    static tryPathColumns(model: Types.ModelClass, path: string): Readonly<Columns.Any>[] | undefined;
    /**
     * Get a list column schemas based on the specified path.
     * @param model Entity model.
     * @param path Entity path.
     * @returns Returns the list of column schemas.
     * @throws Throws an error when the specified model input doesn't resolve to a model class.
     */
    static getPathColumns(model: Types.ModelClass, path: string): Readonly<Columns.Any>[];
    /**
     * Determines whether or not the specified entity is empty.
     * @param model Entity model.
     * @param entity Entity object.
     * @param deep Determines how deep for nested entities. Default value is: 8
     * @returns Returns true when the specified entity is empty, false otherwise.
     */
    static isEmptyModel<E extends Types.Entity>(model: Types.ModelClass<E>, entity: E, deep?: number): boolean;
}
