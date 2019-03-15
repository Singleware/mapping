/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '../types';
import { Real } from './real';
import { Virtual } from './virtual';
import { Joint } from './joint';

export { Real } from './real';
export { Virtual } from './virtual';
export { Joint } from './joint';

/**
 * Type declaration for map of real columns.
 */
export type RealRow = Types.Map<Real>;

/**
 * Type declaration for map of virtual columns.
 */
export type VirtualRow = Types.Map<Virtual>;

/**
 * Type declaration for map of joint columns.
 */
export type JointRow = Types.Map<Joint>;
