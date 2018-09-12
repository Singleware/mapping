/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Column } from './column';

/**
 * Schema map interface.
 */
export interface Map<T> {
  [name: string]: T;
}
