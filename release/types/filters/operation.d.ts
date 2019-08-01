/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Operator } from './operator';

/**
 * Operation filter interface.
 */
export interface Operation {
  /**
   * Operation operator.
   */
  operator: Operator;
  /**
   * Operation value.
   */
  value: any;
}
