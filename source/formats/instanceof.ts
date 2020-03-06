/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';

import * as Types from '../types';

import { Helper } from '../helper';

/**
 * Instance validator class.
 */
@Class.Describe()
export class InstanceOf extends Class.Null implements Validator.Format {
  /**
   * Expected type.
   */
  @Class.Private()
  private type: Types.ModelInput;

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
    return `Instance of ${this.model.name}`;
  }

  /**
   * Model class.
   */
  @Class.Public()
  public get model(): Types.ModelClass {
    return Helper.tryEntityModel(this.type) ?? <Types.ModelClass>this.type;
  }

  /**
   * Validate the specified data.
   * @param data Data to be validated.
   * @returns Returns true when the data is valid, false otherwise.
   */
  @Class.Public()
  public validate(data: any): boolean {
    return data instanceof this.model;
  }
}
