"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Types = require("../types");
const schema_1 = require("../schema");
/**
 * Normalizer helper class.
 */
let Normalizer = class Normalizer extends Class.Null {
    /**
     * Creates a new normalized entry array based on the specified model type and entity list.
     * @param model Model type.
     * @param entities Entity list.
     * @param multiple Determines whether each value in the specified list is a sub list.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated entry array.
     */
    static createArray(model, entities, multiple, aliased, unsafe) {
        const data = [];
        for (const entity of entities) {
            if (multiple && entity instanceof Array) {
                data.push(this.createArray(model, entity, false, aliased, unsafe));
            }
            else {
                data.push(this.create(model, entity, aliased, unsafe));
            }
        }
        return data;
    }
    /**
     * Creates a new normalized entry map based on the specified model type and entity map.
     * @param model Model type.
     * @param entity Entity map.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated entry map.
     */
    static createMap(model, entity, aliased, unsafe) {
        const data = {};
        for (const property in entity) {
            data[property] = this.create(model, entity[property], aliased, unsafe);
        }
        return data;
    }
    /**
     * Creates a new normalized entry from the specified column schema and entity value.
     * @param model Model type.
     * @param schema Column schema.
     * @param entity Entity value.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the normalized entry or the provided entity value.
     */
    static createValue(model, schema, entity, aliased, unsafe) {
        if (!schema.model || !schema_1.Schema.isEntity(schema.model) || (entity === null && schema.formats.includes(Types.Format.Null))) {
            return entity;
        }
        if (schema.formats.includes(Types.Format.Array)) {
            if (!(entity instanceof Array)) {
                throw new TypeError(`Column '${schema.name}@${schema_1.Schema.getStorageName(model)}' must be an array.`);
            }
            return this.createArray(schema.model, entity, schema.all, aliased, unsafe);
        }
        if (schema.formats.includes(Types.Format.Map)) {
            if (!(entity instanceof Object)) {
                throw new TypeError(`Column '${schema.name}@${schema_1.Schema.getStorageName(model)}' must be a map.`);
            }
            return this.createMap(schema.model, entity, aliased, unsafe);
        }
        return this.create(schema.model, entity, aliased, unsafe);
    }
    /**
     * Creates a new normalized entry based on the specified model type and entity value.
     * @param model Model type.
     * @param entity Entity value.
     * @param aliased Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated entry.
     */
    static create(model, entity, aliased, unsafe) {
        const columns = { ...schema_1.Schema.getRealRow(model), ...schema_1.Schema.getVirtualRow(model) };
        const data = {};
        for (const name in columns) {
            const schema = columns[name];
            if (unsafe || !schema.hidden) {
                const value = entity[name];
                if (value !== void 0) {
                    const input = this.createValue(model, schema, schema.caster(value, Types.Cast.Normalize), aliased, unsafe);
                    if (input !== void 0) {
                        data[(aliased ? schema_1.Schema.getColumnName(schema) : schema.name)] = input;
                    }
                }
            }
        }
        return data;
    }
};
__decorate([
    Class.Private()
], Normalizer, "createArray", null);
__decorate([
    Class.Private()
], Normalizer, "createMap", null);
__decorate([
    Class.Private()
], Normalizer, "createValue", null);
__decorate([
    Class.Public()
], Normalizer, "create", null);
Normalizer = __decorate([
    Class.Describe()
], Normalizer);
exports.Normalizer = Normalizer;
//# sourceMappingURL=normalizer.js.map