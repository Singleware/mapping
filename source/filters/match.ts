/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Operations from './operations';

import { Operation } from './operation';

/**
 * Match filter interface.
 */
export interface Match {
  [column: string]:
    | Operation
    | Operations.LessThan
    | Operations.LessThanOrEqual
    | Operations.Equal
    | Operations.NotEqual
    | Operations.GreaterThanOrEqual
    | Operations.GreaterThan
    | Operations.Contain
    | Operations.NotContain
    | Operations.Between
    | Operations.RegExp;
}
