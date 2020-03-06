/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Operator filter.
 */
export const enum Operator {
  LessThan = 'lt',
  LessThanOrEqual = 'lte',
  Equal = 'eq',
  NotEqual = 'ne',
  GreaterThanOrEqual = 'gte',
  GreaterThan = 'gt',
  Contain = 'in',
  NotContain = 'nin',
  Between = 'bt',
  RegExp = 're'
}
