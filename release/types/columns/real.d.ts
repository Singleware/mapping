/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Validator from '@singleware/types';

import * as Types from '../types';

import { Base } from './base';

/**
 * Real column interface.
 */
export interface Real extends Base {
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
  validations: Validator.Format[];
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
   * Valid column values for enumerations.
   */
  values?: string[];
}
