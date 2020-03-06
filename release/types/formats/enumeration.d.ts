/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';
import * as Types from '../types';
/**
 * Enumeration validator class.
 */
export declare class Enumeration extends Class.Null implements Validator.Format {
    /**
     * Expected entries.
     */
    private entries;
    /**
     * Default constructor.
     * @param entries Expected entries.
     */
    constructor(entries: Types.ModelValues);
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
