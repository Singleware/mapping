/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Operator } from '../operator';

/**
 * Operation 'Not Equal' interface.
 */
export interface NotEqual {
  /**
   * Operation value.
   */
  [Operator.NotEqual]: any;
}
