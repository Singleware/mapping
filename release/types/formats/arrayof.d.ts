/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';
import * as Types from '../types';
/**
 * Array validator class.
 */
export declare class ArrayOf extends Class.Null implements Validator.Format {
    /**
     * Expected type.
     */
    private type;
    /**
     * Model class.
     */
    private get model();
    /**
     * Determines whether or not the specified list of items contains only primitive types.
     * @param items List of items.
     * @returns Returns true when the list of items is valid, false otherwise.
     */
    private validatePrimitives;
    /**
     * Determines whether or not the specified list of items contains only object types.
     * @param items List of items.
     * @returns Returns true when the list of items is valid, false otherwise.
     */
    private validateObjects;
    /**
     * Default constructor.
     * @param type Expected type.
     */
    constructor(type: Types.ModelInput);
    /**
     * Validator name.
     */
    get name(): string;
    /**
     * Validate the specified data.
     * @param data Data to be validated.
     * @returns Returns true when the data is valid, false otherwise.
     */
    validate(data: any): boolean;
}
