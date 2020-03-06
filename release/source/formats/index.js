"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var mapof_1 = require("./mapof");
exports.MapOf = mapof_1.MapOf;
var arrayof_1 = require("./arrayof");
exports.ArrayOf = arrayof_1.ArrayOf;
var instanceof_1 = require("./instanceof");
exports.InstanceOf = instanceof_1.InstanceOf;
var enumeration_1 = require("./enumeration");
exports.Enumeration = enumeration_1.Enumeration;
// Imported aliases.
const Validator = require("@singleware/types");
/**
 * Any value validator class.
 */
exports.Any = Validator.Common.Any;
/**
 * Null value validator class.
 */
exports.Null = Validator.Common.Null;
/**
 * Undefined value validator class.
 */
exports.Undefined = Validator.Common.Undefined;
/**
 * Boolean validator class.
 */
exports.Boolean = Validator.Common.Boolean;
/**
 * Integer validator class.
 */
exports.Integer = Validator.Common.Integer;
/**
 * Decimal validator class.
 */
exports.Decimal = Validator.Common.Decimal;
/**
 * Number validator class.
 */
exports.Number = Validator.Common.Number;
/**
 * String validator class.
 */
exports.String = Validator.Common.String;
/**
 * Pattern validator class.
 */
exports.Pattern = Validator.Common.Pattern;
/**
 * Timestamp ISO 8601 validator class.
 */
exports.Timestamp = Validator.Common.Timestamp;
//# sourceMappingURL=index.js.map