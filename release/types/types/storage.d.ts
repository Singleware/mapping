/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Columns from '../columns';
import { Map } from './map';

/**
 * Data storage interface.
 */
export interface Storage {
  /**
   * Storage name.
   */
  name: string;
  /**
   * Primary column name.
   */
  primary?: string;
  /**
   * Real columns.
   */
  real: Map<Columns.Real>;
  /**
   * Virtual columns.
   */
  virtual: Map<Columns.Virtual>;
}
