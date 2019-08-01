"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var entity_1 = require("./entity");
exports.Entity = entity_1.Entity;
var mapper_1 = require("./mapper");
exports.Mapper = mapper_1.Mapper;
var schema_1 = require("./schema");
exports.Schema = schema_1.Schema;
// Imported aliases.
const Types = require("./types");
const Columns = require("./columns");
const Filters = require("./filters");
const Castings = require("./castings");
/**
 * Types namespace.
 */
exports.Types = Types;
/**
 * Columns namespace.
 */
exports.Columns = Columns;
/**
 * Filters namespace.
 */
exports.Filters = Filters;
/**
 * Castings namespace.
 */
exports.Castings = Castings;
//# sourceMappingURL=index.js.map