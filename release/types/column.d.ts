/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '@singleware/types';

import { Constructor } from './types';
import { Entity } from './entity';
import { Formats } from './formats';
import { Row } from './row';

/**
 * Schema column interface.
 */
export interface Column {
  /**
   * Column name.
   */
  name: string;
  /**
   * Column alias name.
   */
  alias?: string;
  /**
   * Supported column data types.
   */
  types: Formats[];
  /**
   * Supported column data formats.
   */
  validators: Types.Format[];
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
  model?: Constructor<Entity>;
  /**
   * Sub row schema.
   */
  schema?: Row;
}
