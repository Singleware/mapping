/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '../types';

import { Base } from './base';
import { Real } from './real';
import { Virtual } from './virtual';

export { Base } from './base';
export { Real } from './real';
export { Virtual } from './virtual';

/**
 * Type declaration for map of columns base.
 */
export type BaseRow = Types.Map<Base>;

/**
 * Type declaration for map of real columns.
 */
export type RealRow = Types.Map<Real>;

/**
 * Type declaration for map of virtual columns.
 */
export type VirtualRow = Types.Map<Virtual>;
