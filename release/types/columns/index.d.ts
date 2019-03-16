import * as Types from '../types';
import { Base } from './base';
import { Real } from './real';
import { Virtual } from './virtual';
import { Joint } from './joint';
export { Base } from './base';
export { Real } from './real';
export { Virtual } from './virtual';
export { Joint } from './joint';
/**
 * Type declaration for map of columns base.
 */
export declare type BaseRow = Types.Map<Base>;
/**
 * Type declaration for map of real columns.
 */
export declare type RealRow = Types.Map<Real>;
/**
 * Type declaration for map of virtual columns.
 */
export declare type VirtualRow = Types.Map<Virtual>;
/**
 * Type declaration for map of joint columns.
 */
export declare type JointRow = Types.Map<Joint>;
