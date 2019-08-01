/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Order } from './order';

/**
 * Sort filter interface.
 */
export interface Sort {
  [column: string]: Order;
}
