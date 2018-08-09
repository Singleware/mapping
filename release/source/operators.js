"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Filter operators enumeration.
 */
var Operators;
(function (Operators) {
    Operators[Operators["LESS"] = 0] = "LESS";
    Operators[Operators["LESS_OR_EQUAL"] = 1] = "LESS_OR_EQUAL";
    Operators[Operators["EQUAL"] = 2] = "EQUAL";
    Operators[Operators["NOT_EQUAL"] = 3] = "NOT_EQUAL";
    Operators[Operators["GREATER_OR_EQUAL"] = 4] = "GREATER_OR_EQUAL";
    Operators[Operators["GREATER"] = 5] = "GREATER";
    Operators[Operators["CONTAIN"] = 6] = "CONTAIN";
    Operators[Operators["BETWEEN"] = 7] = "BETWEEN";
    Operators[Operators["NOT_CONTAIN"] = 8] = "NOT_CONTAIN";
})(Operators = exports.Operators || (exports.Operators = {}));
