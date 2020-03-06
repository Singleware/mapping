/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Operator } from '../operator';

/**
 * Operation 'RegExp' interface.
 */
export interface RegExp {
  /**
   * Operation value.
   */
  [Operator.RegExp]: any;
}
