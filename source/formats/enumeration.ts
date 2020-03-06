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
@Class.Describe()
export class Enumeration extends Class.Null implements Validator.Format {
  /**
   * Expected entries.
   */
  @Class.Private()
  private entries: Types.ModelValues;

  /**
   * Default constructor.
   * @param entries Expected entries.
   */
  constructor(entries: Types.ModelValues) {
    super();
    this.entries = entries;
  }

  /**
   * Validator name.
   */
  @Class.Public()
  public get name(): string {
    return `Enumeration of ${this.entries instanceof Array ? this.entries.join(', ') : this.entries.name}`;
  }

  /**
   * Validate the specified data.
   * @param data Data to be validated.
   * @returns Returns true when the data is valid, false otherwise.
   */
  @Class.Public()
  public validate(data: any): boolean {
    return (this.entries instanceof Array ? this.entries : this.entries()).includes(data);
  }
}
