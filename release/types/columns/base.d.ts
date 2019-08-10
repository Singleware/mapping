/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Validators from '@singleware/types';

import * as Types from '../types';

/**
 * Base column interface.
 */
export interface Base<T extends Types.Entity = Types.Entity> {
  /**
   * Column type.
   */
  type: Types.Column;
  /**
   * Column name.
   */
  name: string;
  /**
   * Column data formats.
   */
  formats: Types.Format[];
  /**
   * Column data format validation.
   */
  validations: Validators.Format[];
  /**
   * Column caster callback.
   */
  caster: Types.Caster;
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
  model?: Types.Model<T>;
}
