/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '../types';

import { Base } from './base';

/**
 * Real column interface.
 */
export interface Real<T extends Types.Entity = Types.Entity> extends Base<T> {
  /**
   * Column alias name.
   */
  alias?: string;
  /**
   * Determines whether the column is unique or not.
   */
  unique?: boolean;
  /**
   * Minimum column value.
   */
  minimum?: number;
  /**
   * Maximum column value.
   */
  maximum?: number;
  /**
   * Column pattern.
   */
  pattern?: RegExp;
  /**
   * Valid values for enumerations.
   */
  values?: Types.ModelValues;
}
