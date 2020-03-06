/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
export { Base } from './base';
export { Real } from './real';
export { Virtual } from './virtual';
export { Helper } from './helper';
import * as Types from '../types';
import { Base } from './base';
import { Real } from './real';
import { Virtual } from './virtual';
/**
 * Type declaration for any column.
 */
export declare type Any<T extends Types.Entity = Types.Entity> = Real<T> | Virtual<T>;
/**
 * Type declaration for map of columns base.
 */
export declare type BaseRow = Types.Map<Base>;
/**
 * Type declaration for a map of real columns.
 */
export declare type RealRow = Types.Map<Real>;
/**
 * Type declaration for a map of virtual columns.
 */
export declare type VirtualRow = Types.Map<Virtual>;
/**
 * Type declaration for a map of readonly columns.
 */
export declare type ReadonlyRow<T> = Types.Map<Readonly<T>>;
