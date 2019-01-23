/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Order } from './order';

/**
 * Sort statement interface.
 */
export interface Sort {
  [column: string]: Order;
}
