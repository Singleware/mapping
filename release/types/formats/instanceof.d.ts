/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';
import * as Types from '../types';
/**
 * Instance validator class.
 */
export declare class InstanceOf extends Class.Null implements Validator.Format {
    /**
     * Expected type.
     */
    private type;
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
     * Model class.
     */
    get model(): Types.ModelClass;
    /**
     * Validate the specified data.
     * @param data Data to be validated.
     * @returns Returns true when the data is valid, false otherwise.
     */
    validate(data: any): boolean;
}
