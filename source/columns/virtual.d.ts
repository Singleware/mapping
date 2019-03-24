/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '../types';
import * as Statements from '../statements';

import { Base } from './base';

/**
 * Virtual column interface.
 */
export interface Virtual extends Base {
  /**
   * Local column name.
   */
  local: string;
  /**
   * Foreign column name.
   */
  foreign: string;
  /**
   * Column entity model.
   */
  model: Types.Model<Types.Entity>;
  /**
   * Column filter.
   */
  filter?: Statements.Filter;
  /**
   * Determines whether the local column contains multiples IDs.
   */
  multiple?: boolean;
  /**
   * Determines whether all values from the foreign column must be loaded.
   */
  all?: boolean;
}
