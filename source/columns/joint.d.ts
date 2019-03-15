/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Joint column interface.
 */
export interface Joint {
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
