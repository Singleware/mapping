/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
export { MapOf } from './mapof';
export { ArrayOf } from './arrayof';
export { InstanceOf } from './instanceof';
export { Enumeration } from './enumeration';
import * as Validator from '@singleware/types';
/**
 * Any value validator class.
 */
export import Any = Validator.Common.Any;
/**
 * Null value validator class.
 */
export import Null = Validator.Common.Null;
/**
 * Undefined value validator class.
 */
export import Undefined = Validator.Common.Undefined;
/**
 * Boolean validator class.
 */
export import Boolean = Validator.Common.Boolean;
/**
 * Integer validator class.
 */
export import Integer = Validator.Common.Integer;
/**
 * Decimal validator class.
 */
export import Decimal = Validator.Common.Decimal;
/**
 * Number validator class.
 */
export import Number = Validator.Common.Number;
/**
 * String validator class.
 */
export import String = Validator.Common.String;
/**
 * Pattern validator class.
 */
export import Pattern = Validator.Common.Pattern;
/**
 * Timestamp ISO 8601 validator class.
 */
export import Timestamp = Validator.Common.Timestamp;
