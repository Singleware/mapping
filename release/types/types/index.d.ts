/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import { Entity } from './entity';
export { Map } from './map';
export { Entity } from './entity';
export { Format } from './format';
export { Storage } from './storage';
export { View } from './view';
/**
 * Type declaration for entity model constructors.
 */
export declare type Model<T extends Entity = Entity> = Class.Constructor<T>;
/**
 * Type declaration for converters callback.
 */
export declare type Converter<T = any> = (input: T | undefined) => T;
/**
 * Type declaration for class decorators.
 */
export declare type ClassDecorator = Class.ClassDecorator;
/**
 * Type declaration for decorators of classes properties.
 */
export declare type PropertyDecorator = Class.MemberDecorator;
