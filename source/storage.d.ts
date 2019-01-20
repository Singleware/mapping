/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Virtual } from './virtual';
import { Column } from './column';
import { Map } from './map';

/**
 * Schema storage interface.
 */
export interface Storage {
  /**
   * Storage name.
   */
  name?: string;
  /**
   * Primary column name.
   */
  primary?: string;
  /**
   * Real columns.
   */
  realColumns: Map<Column>;
  /**
   * Virtual columns.
   */
  virtualColumns: Map<Virtual>;
}
