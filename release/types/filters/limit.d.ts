/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Order } from './order';

/**
 * Limit filter interface.
 */
export interface Limit {
  /**
   * Starting row index.
   */
  start: number;
  /**
   * Number of maximum results.
   */
  count: number;
}
