/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Operator } from './operator';

/**
 * Filter operation interface.
 */
export interface Operation {
  /**
   * Filter operator.
   */
  operator: Operator;
  /**
   * Filter operation value.
   */
  value: any;
}
