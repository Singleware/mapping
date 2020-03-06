/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import { Operation } from './operation';

/**
 * Filters helper class.
 */
@Class.Describe()
export class Helper extends Class.Null {
  /**
   * Determines whether or not the specified input is an operation.
   * @param input Input object.
   * @returns Returns true when the input is an operation, false otherwise.
   */
  @Class.Public()
  public static isOperation(input: any): input is Operation {
    return 'operator' in input && 'value' in input;
  }
}
