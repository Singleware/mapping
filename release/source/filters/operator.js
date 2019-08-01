"use strict";
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Operator filter.
 */
var Operator;
(function (Operator) {
    Operator[Operator["Less"] = 0] = "Less";
    Operator[Operator["LessOrEqual"] = 1] = "LessOrEqual";
    Operator[Operator["Equal"] = 2] = "Equal";
    Operator[Operator["NotEqual"] = 3] = "NotEqual";
    Operator[Operator["GreaterOrEqual"] = 4] = "GreaterOrEqual";
    Operator[Operator["Greater"] = 5] = "Greater";
    Operator[Operator["Contain"] = 6] = "Contain";
    Operator[Operator["Between"] = 7] = "Between";
    Operator[Operator["NotContain"] = 8] = "NotContain";
    Operator[Operator["RegEx"] = 9] = "RegEx";
})(Operator = exports.Operator || (exports.Operator = {}));
//# sourceMappingURL=operator.js.map