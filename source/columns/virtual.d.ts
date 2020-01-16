/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '../types';
import * as Filters from '../filters';

import { Base } from './base';

/**
 * Virtual column interface.
 */
export interface Virtual<T extends Types.Entity = Types.Entity> extends Base<T> {
  /**
   * Local column name.
   */
  local: string;
  /**
   * Foreign column name.
   */
  foreign: string;
  /**
   * Determines whether the local column contains multiples IDs.
   */
  multiple?: boolean;
  /**
   * Fields to be selected in the virtual column.
   */
  fields?: string[];
  /**
   * Column entity model.
   */
  model: Types.ModelClass<T> | Types.ModelCallback<T>;
  /**
   * Column query.
   */
  query?: Filters.Query;
  /**
   * Determines whether all values from the foreign column must be loaded.
   */
  all?: boolean;
}
