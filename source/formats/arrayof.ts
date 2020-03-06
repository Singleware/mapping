/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';

import * as Types from '../types';

import { Helper } from '../helper';

/**
 * Array validator class.
 */
@Class.Describe()
export class ArrayOf extends Class.Null implements Validator.Format {
  /**
   * Expected type.
   */
  @Class.Private()
  private type: Types.ModelInput;

  /**
   * Model class.
   */
  @Class.Private()
  private get model(): Types.ModelClass {
    return Helper.tryEntityModel(this.type) ?? <Types.ModelClass>this.type;
  }

  /**
   * Determines whether or not the specified list of items contains only primitive types.
   * @param items List of items.
   * @returns Returns true when the list of items is valid, false otherwise.
   */
  @Class.Private()
  private validatePrimitives(items: any[]): boolean {
    const type = this.type.name.toLowerCase();
    for (const item of items) {
      if (typeof item !== type) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determines whether or not the specified list of items contains only object types.
   * @param items List of items.
   * @returns Returns true when the list of items is valid, false otherwise.
   */
  @Class.Private()
  private validateObjects(items: any[]): boolean {
    const type = this.model;
    for (const item of items) {
      if (!(item instanceof type)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Default constructor.
   * @param type Expected type.
   */
  constructor(type: Types.ModelInput) {
    super();
    this.type = type;
  }

  /**
   * Validator name.
   */
  @Class.Public()
  public get name(): string {
    return `Array of ${this.model.name}`;
  }

  /**
   * Validate the specified data.
   * @param data Data to be validated.
   * @returns Returns true when the data is valid, false otherwise.
   */
  @Class.Public()
  public validate(data: any): boolean {
    if (data instanceof Array) {
      switch (this.type) {
        case String:
        case Boolean:
        case Number:
          return this.validatePrimitives(data);
        default:
          return this.validateObjects(data);
      }
    }
    return false;
  }
}
