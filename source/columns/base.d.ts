/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Validator from '@singleware/types';

import * as Types from '../types';
import { Columns } from '..';

/**
 * Base column interface.
 */
export interface Base {
  /**
   * Column type.
   */
  type: 'real' | 'virtual';
  /**
   * Column name.
   */
  name: string;
  /**
   * Column views.
   */
  views: RegExp[];
  /**
   * Column data formats.
   */
  formats: Types.Format[];
  /**
   * Column data format validation.
   */
  validations: Validator.Format[];
  /**
   * Column converter callback.
   */
  converter?: Types.Converter;
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
  readOnly?: boolean;
  /**
   * Determines whether the column is write-only or not.
   */
  writeOnly?: boolean;
  /**
   * Column entity model.
   */
  model?: Types.Model<Types.Entity>;
}
