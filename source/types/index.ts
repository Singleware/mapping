/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
export { Map } from './map';
export { Cast } from './cast';
export { Entity } from './entity';
export { Column } from './column';
export { Format } from './format';
export { Storage } from './storage';

// Imported aliases.
import * as Class from '@singleware/class';

import { Entity } from './entity';
import { Cast } from './cast';

/**
 * Type declaration for entity model constructors.
 */
export type ModelClass<T extends Entity = Entity> = Class.Constructor<T>;

/**
 * Type declaration for entity model constructor callback.
 */
export type ModelCallback<T extends Entity = Entity> = () => ModelClass<T>;

/**
 * Type declaration for model decorators.
 */
export type ModelDecorator = (target: Object, property: string | symbol, descriptor?: PropertyDescriptor) => any;

/**
 * Type declaration for model input.
 */
export type ModelInput<T extends Entity = Entity> = ModelClass<T> | ModelCallback<T>;

/**
 * Type declaration for model values.
 */
export type ModelValues = string[] | (() => string[]);

/**
 * Type declaration for caster callback.
 */
export type ModelCaster<T = any> = (input: T | undefined, type: Cast) => T;

/**
 * Class decorator.
 */
export import ClassDecorator = Class.ClassDecorator;

/**
 * Property decorator.
 */
export import PropertyDecorator = Class.MemberDecorator;
