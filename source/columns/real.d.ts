/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Validator from '@singleware/types';

import * as Types from '../types';

/**
 * Real column interface.
 */
export interface Real {
  /**
   * Column name.
   */
  name: string;
  /**
   * Column alias name.
   */
  alias?: string;
  /**
   * Column data formats.
   */
  formats: Types.Format[];
  /**
   * Column data format validation.
   */
  validation: Validator.Format[];
  /**
   * Determines whether the column is unique or not.
   */
  unique?: boolean;
  /**
   * Determines whether the column is required or not.
   */
  required?: boolean;
  /**
   * Determines whether the column is hidden or not.
   */
  hidden?: boolean;
  /**
   * Determines whether the column is read-only or not.
   */
  readonly?: boolean;
  /**
   * Determines whether the column is write-only or not.
   */
  writeonly?: boolean;
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
   * Valid column values for enumerations.
   */
  values?: string[];
  /**
   * Column entity model.
   */
  model?: Types.Model<Types.Entity>;
  /**
   * Map of sub schemas.
   */
  schema?: Types.Map<Real>;
}
