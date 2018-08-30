/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

/**
 * Type declaration for entity class constructors.
 */
export type Constructor<T extends Object = any> = Class.Constructor<T>;

/**
 * Type declaration for class decorators.
 */
export type ClassDecorator = Class.ClassDecorator;

/**
 * Type declaration for decorators of classes properties.
 */
export type PropertyDecorator = Class.MemberDecorator;
