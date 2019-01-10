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
  /**
   * Storage name.
   */
  storage: string;
  /**
   * Determines whether the local column contains multiple IDs.
   */
  multiple: boolean;
}
