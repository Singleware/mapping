"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Schema formats enumeration.
 */
var Formats;
(function (Formats) {
    Formats[Formats["ID"] = 0] = "ID";
    Formats[Formats["NULL"] = 1] = "NULL";
    Formats[Formats["BOOLEAN"] = 2] = "BOOLEAN";
    Formats[Formats["INTEGER"] = 3] = "INTEGER";
    Formats[Formats["DECIMAL"] = 4] = "DECIMAL";
    Formats[Formats["NUMBER"] = 5] = "NUMBER";
    Formats[Formats["STRING"] = 6] = "STRING";
    Formats[Formats["ENUMERATION"] = 7] = "ENUMERATION";
    Formats[Formats["PATTERN"] = 8] = "PATTERN";
    Formats[Formats["TIMESTAMP"] = 9] = "TIMESTAMP";
    Formats[Formats["DATE"] = 10] = "DATE";
    Formats[Formats["ARRAY"] = 11] = "ARRAY";
    Formats[Formats["OBJECT"] = 12] = "OBJECT";
})(Formats = exports.Formats || (exports.Formats = {}));
