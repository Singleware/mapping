import * as Class from '@singleware/class';
import { Entity } from './entity';
export { Map } from './map';
export { Entity } from './entity';
export { Format } from './format';
export { Storage } from './storage';
/**
 * Type declaration for entity model constructors.
 */
export declare type Model<T extends Entity = Entity> = Class.Constructor<T>;
/**
 * Type declaration for class decorators.
 */
export declare type ClassDecorator = Class.ClassDecorator;
/**
 * Type declaration for decorators of classes properties.
 */
export declare type PropertyDecorator = Class.MemberDecorator;
