/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Constructor } from './types';
import { Entity } from './entity';

/**
 * Aggregate interface.
 */
export interface Aggregate {
  /**
   * Storage name.
   */
  storage: string;
  /**
   * Local column name.
   */
  local: string;
  /**
   * Foreign column name.
   */
  foreign: string;
  /**
   * Virtual column name.
   */
  virtual: string;
}
