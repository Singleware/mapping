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
     * Creates a new normalized list based on the specified model type and entity list.
     * @param model Model type.
     * @param entities Entity list.
     * @param multiple Determines whether each value in the specified list can be a sub list.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @returns Returns the generated list.
     */
    static createList(model, entities, multiple, alias, unsafe) {
        const list = [];
        for (const entity of entities) {
            if (multiple && entity instanceof Array) {
                list.push(this.createList(model, entity, false, alias, unsafe));
            }
            else {
                list.push(this.createEntry(model, entity, alias, unsafe, false));
            }
        }
        return list;
    }
    /**
     * Create a new normalized map based on the specified model type, viewed fields and entity map.
     * @param model Model type.
     * @param entity Entity map.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @param path Current path for unrolled values.
     * @param data Current data for unrolled values.
     * @returns Returns the generated map.
     */
    static createMap(model, entity, alias, unsafe) {
        const map = {};
        for (const property in entity) {
            map[property] = this.createEntry(model, entity[property], alias, unsafe, false);
        }
        return map;
    }
    /**
     * Creates a new normalized value from the specified column schema and entity value.
     * @param model Model type.
     * @param schema Column schema.
     * @param entity Entity value.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @param path Current path for unrolled values.
     * @param data Current data for unrolled values.
     * @returns Returns the normalized value.
     * @throws Throws an error when the value isn't supported.
     */
    static createValue(model, schema, entity, alias, unsafe, unroll, path, data) {
        if (schema.model && schema_1.Schema.isEntity(schema.model)) {
            if (entity instanceof Array) {
                if (schema.formats.includes(12 /* Array */)) {
                    return this.createList(schema_1.Schema.getEntityModel(schema.model), entity, schema.all || false, alias, unsafe);
                }
                else {
                    throw new TypeError(`Column '${schema.name}@${schema_1.Schema.getStorageName(model)}' doesn't support array types.`);
                }
            }
            else if (entity instanceof Object) {
                if (schema.formats.includes(14 /* Object */)) {
                    if (unroll) {
                        return this.createEntry(schema_1.Schema.getEntityModel(schema.model), entity, alias, unsafe, true, path, data), void 0;
                    }
                    else {
                        return this.createEntry(schema_1.Schema.getEntityModel(schema.model), entity, alias, unsafe, false);
                    }
                }
                else if (schema.formats.includes(13 /* Map */)) {
                    return this.createMap(schema_1.Schema.getEntityModel(schema.model), entity, alias, unsafe);
                }
                else {
                    throw new TypeError(`Column '${schema.name}@${schema_1.Schema.getStorageName(model)}' doesn't support object types.`);
                }
            }
        }
        return schema.caster(entity, "normalize" /* Normalize */);
    }
    /**
     * Creates a new normalized entry based on the specified model type and entity value.
     * @param model Model type.
     * @param entity Entity value.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @param path Current path for unrolled values.
     * @param data Current data for unrolled values.
     * @returns Returns the generated entry.
     */
    static createEntry(model, entity, alias, unsafe, unroll, path, data) {
        const columns = { ...schema_1.Schema.getRealRow(model), ...schema_1.Schema.getVirtualRow(model) };
        const entry = (data || {});
        for (const name in columns) {
            const schema = columns[name];
            const value = entity[name];
            if (value !== void 0 && (unsafe || !schema.hidden)) {
                let property = alias ? schema_1.Schema.getColumnName(schema) : schema.name;
                if (unroll) {
                    property = path ? `${path}.${property}` : property;
                }
                const result = this.createValue(model, schema, value, alias, unsafe, unroll, property, entry);
                if (result !== void 0) {
                    entry[property] = result;
                }
            }
        }
        return entry;
    }
    /**
     * Creates a new normalized object based on the specified model type and entity.
     * @param model Model type.
     * @param entity Entity object.
     * @param alias Determines whether all column names should be aliased.
     * @param unsafe Determines whether all hidden columns should be visible.
     * @param unroll Determines whether all columns should be unrolled.
     * @returns Returns the generated object.
     */
    static create(model, entity, alias, unsafe, unroll) {
        return this.createEntry(model, entity, alias || false, unsafe || false, unroll || false);
    }
};
__decorate([
    Class.Private()
], Normalizer, "createList", null);
__decorate([
    Class.Private()
], Normalizer, "createMap", null);
__decorate([
    Class.Private()
], Normalizer, "createValue", null);
__decorate([
    Class.Private()
], Normalizer, "createEntry", null);
__decorate([
    Class.Public()
], Normalizer, "create", null);
Normalizer = __decorate([
    Class.Describe()
], Normalizer);
exports.Normalizer = Normalizer;
//# sourceMappingURL=normalizer.js.map