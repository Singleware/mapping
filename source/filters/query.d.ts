/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Match } from './match';
import { Limit } from './limit';
import { Sort } from './sort';

/**
 * Query filter interface.
 */
export interface Query {
  /**
   * Pre matching fields. (Performed before any join operation)
   */
  pre?: Match | Match[];
  /**
   * Post matching fields. (Performed after all join operations)
   */
  post?: Match | Match[];
  /**
   * Sorting fields.
   */
  sort?: Sort;
  /**
   * Limit results.
   */
  limit?: Limit;
}
