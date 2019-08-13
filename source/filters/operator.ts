/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Operator filter.
 */
export enum Operator {
  LessThan = 'lt',
  LessThanOrEqual = 'le',
  Equal = 'eq',
  NotEqual = 'ne',
  GreaterThan = 'gt',
  GreaterThanOrEqual = 'ge',
  Contain = 'in',
  Between = 'bt',
  NotContain = 'ni',
  RegExp = 're'
}
