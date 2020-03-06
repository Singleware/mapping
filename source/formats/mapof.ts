/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';

import * as Types from '../types';

import { Helper } from '../helper';

/**
 * Map validator class.
 */
@Class.Describe()
export class MapOf extends Class.Null implements Validator.Format {
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
   * Determines whether or not the specified map of items contains only primitive types.
   * @param items Map of items.
   * @returns Returns true when the map of items is valid, false otherwise.
   */
  @Class.Private()
  private validatePrimitives(items: Types.Map<any>): boolean {
    const type = this.type.name.toLowerCase();
    for (const key in items) {
      if (typeof items[key] !== type) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determines whether or not the specified map of items contains only object types.
   * @param items Map of items.
   * @returns Returns true when the map of items is valid, false otherwise.
   */
  @Class.Private()
  private validateObjects(items: Types.Map<any>): boolean {
    const type = this.model;
    for (const key in items) {
      if (!(items[key] instanceof type)) {
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
    return `Map of ${this.model.name}`;
  }

  /**
   * Validate the specified data.
   * @param data Data to be validated.
   * @returns Returns true when the data is valid, false otherwise.
   */
  @Class.Public()
  public validate(data: any): boolean {
    if (data instanceof Object) {
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
