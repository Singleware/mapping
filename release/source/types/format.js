"use strict";
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Data formats.
 */
var Format;
(function (Format) {
    Format[Format["ID"] = 0] = "ID";
    Format[Format["NULL"] = 1] = "NULL";
    Format[Format["BINARY"] = 2] = "BINARY";
    Format[Format["BOOLEAN"] = 3] = "BOOLEAN";
    Format[Format["INTEGER"] = 4] = "INTEGER";
    Format[Format["DECIMAL"] = 5] = "DECIMAL";
    Format[Format["NUMBER"] = 6] = "NUMBER";
    Format[Format["STRING"] = 7] = "STRING";
    Format[Format["ENUMERATION"] = 8] = "ENUMERATION";
    Format[Format["PATTERN"] = 9] = "PATTERN";
    Format[Format["TIMESTAMP"] = 10] = "TIMESTAMP";
    Format[Format["DATE"] = 11] = "DATE";
    Format[Format["ARRAY"] = 12] = "ARRAY";
    Format[Format["MAP"] = 13] = "MAP";
    Format[Format["OBJECT"] = 14] = "OBJECT";
})(Format = exports.Format || (exports.Format = {}));
