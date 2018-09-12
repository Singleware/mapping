/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Constructor } from './types';
import { Entity } from './entity';

/**
 * Virtual column schema interface.
 */
export interface Virtual {
  /**
   * Column name.
   */
  name: string;
  /**
   * Foreign column name.
   */
  foreign: string;
  /**
   * Local column name.
   */
  local?: string;
  /**
   * Foreign entity model.
   */
  model?: Constructor<Entity>;
}
