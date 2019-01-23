"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Statement operators.
 */
var Operator;
(function (Operator) {
    Operator[Operator["LESS"] = 0] = "LESS";
    Operator[Operator["LESS_OR_EQUAL"] = 1] = "LESS_OR_EQUAL";
    Operator[Operator["EQUAL"] = 2] = "EQUAL";
    Operator[Operator["NOT_EQUAL"] = 3] = "NOT_EQUAL";
    Operator[Operator["GREATER_OR_EQUAL"] = 4] = "GREATER_OR_EQUAL";
    Operator[Operator["GREATER"] = 5] = "GREATER";
    Operator[Operator["CONTAIN"] = 6] = "CONTAIN";
    Operator[Operator["BETWEEN"] = 7] = "BETWEEN";
    Operator[Operator["NOT_CONTAIN"] = 8] = "NOT_CONTAIN";
    Operator[Operator["REGEX"] = 9] = "REGEX";
})(Operator = exports.Operator || (exports.Operator = {}));
