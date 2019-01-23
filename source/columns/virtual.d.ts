/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '../types';

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
   * Foreign entity model.
   */
  model: Types.Model<Types.Entity>;
  /**
   * Local column name.
   */
  local: string;
}
