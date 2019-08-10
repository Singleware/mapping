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
 * Outputer helper class.
 */
let Outputer = class Outputer extends Class.Null {
    /**
     * Determines whether the specified value is an empty result or not.
     * @param value Value to check.
     * @returns Returns true when the specified value is empty, false otherwise.
     */
    static isEmptyResult(value) {
        if (value instanceof Array) {
            return value.length === 0;
        }
        else if (value instanceof Object) {
            return !schema_1.Schema.isEntity(value) && Object.keys(value).length === 0;
        }
        return false;
    }
    /**
     * Creates a new entity array based on the specified model type, viewed fields and entry list.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entries Entry list.
     * @param required Determines whether all required columns must be provided.
     * @param multiple Determines whether each value from the specified list is another list.
     * @returns Returns the generated entity array.
     */
    static createArrayEntity(model, fields, entries, required, multiple) {
        const entities = [];
        for (const entry of entries) {
            let entity;
            if (multiple && entry instanceof Array) {
                entity = this.createArrayEntity(model, fields, entry, required, false);
            }
            else {
                entity = this.createEntity(model, fields, entry, required, false);
            }
            if (entity !== void 0) {
                entities.push(entity);
            }
        }
        return entities;
    }
    /**
     * Create a new entity map based on the specified model type, viewed fields and entry map.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry map.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated entity map.
     */
    static createMapEntity(model, fields, entry, required) {
        const entities = {};
        for (const property in entry) {
            const entity = this.createEntity(model, fields, entry[property], required, false);
            if (entity !== void 0) {
                entities[property] = entity;
            }
        }
        return entities;
    }
    /**
     * Converts if possible the specified entry to an entity.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param schema Column schema.
     * @param entry Entry value.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the original or the converted value.
     * @throws Throws an error when the expected value should be an array or map but the given value is not.
     */
    static createValue(model, fields, schema, entry, required) {
        if (!schema.model || !schema_1.Schema.isEntity(schema.model) || (entry === null && schema.formats.includes(Types.Format.Null))) {
            return entry;
        }
        if (schema.formats.includes(Types.Format.Array)) {
            if (!(entry instanceof Array)) {
                throw new TypeError(`Output column '${schema_1.Schema.getColumnName(schema)}@${schema_1.Schema.getStorageName(model)}' must be an array.`);
            }
            return this.createArrayEntity(schema.model, fields, entry, required, schema.all || false);
        }
        if (schema.formats.includes(Types.Format.Map)) {
            if (!(entry instanceof Object)) {
                throw new TypeError(`Output column '${schema_1.Schema.getColumnName(schema)}@${schema_1.Schema.getStorageName(model)}' must be a map.`);
            }
            return this.createMapEntity(schema.model, fields, entry, required);
        }
        return this.createEntity(schema.model, fields, entry, required, (schema.required || false) && schema.type === Types.Column.Real);
    }
    /**
     * Creates a new entity based on the specified model type, viewed fields and entry.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry value.
     * @param required Determines whether all required columns must be provided.
     * @param wanted Determines whether all columns are wanted by the parent entity.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when required columns aren't supplied or write-only columns were set.
     */
    static createEntity(model, fields, entry, required, wanted) {
        const columns = { ...schema_1.Schema.getRealRow(model, ...fields), ...schema_1.Schema.getVirtualRow(model, ...fields) };
        const entity = new model();
        const missing = [];
        let filled = false;
        for (const name in columns) {
            const schema = columns[name];
            const value = entry[schema_1.Schema.getColumnName(schema)];
            if (value === void 0) {
                if (required && schema.required && !schema.writeOnly) {
                    missing.push(name);
                }
            }
            else {
                if (schema.writeOnly) {
                    throw new Error(`Output column '${name}@${schema_1.Schema.getStorageName(model)}' is write-only.`);
                }
                const output = this.createValue(model, fields, schema, schema.caster(value, Types.Cast.Output), required);
                if (output !== void 0 && (wanted || filled || !this.isEmptyResult(output))) {
                    entity[name] = output;
                    filled = true;
                }
            }
        }
        if (!filled && !wanted) {
            return void 0;
        }
        if (missing.length) {
            throw new Error(`Output column '[${missing.join(',')}]@${schema_1.Schema.getStorageName(model)}' wasn't given.`);
        }
        return entity;
    }
    /**
     * Creates a new entity based on the specified model type, viewed fields and entry value.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry value.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static create(model, fields, entry) {
        return this.createEntity(model, fields, entry, false, true);
    }
    /**
     * Creates a new entity array based on the specified model type, viewed fields and entry list.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createArray(model, fields, entries) {
        return this.createArrayEntity(model, fields, entries, false, false);
    }
    /**
     * Create a new entity map based on the specified model type, viewed fields and entry map.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createMap(model, fields, entry) {
        return this.createMapEntity(model, fields, entry, false);
    }
    /**
     * Creates a new full entity based on the specified model type, viewed fields and entry value.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry value.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static createFull(model, fields, entry) {
        return this.createEntity(model, fields, entry, true, true);
    }
    /**
     * Creates a new full entity array based on the specified model type, viewed fields and entry list.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createFullArray(model, views, entries) {
        return this.createArrayEntity(model, views, entries, true, false);
    }
    /**
     * Create a new full entity map based on the specified model type, viewed fields and entry map.
     * @param model Model type.
     * @param fields Viewed fields.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createFullMap(model, fields, map) {
        return this.createMapEntity(model, fields, map, true);
    }
};
__decorate([
    Class.Private()
], Outputer, "isEmptyResult", null);
__decorate([
    Class.Private()
], Outputer, "createArrayEntity", null);
__decorate([
    Class.Private()
], Outputer, "createMapEntity", null);
__decorate([
    Class.Private()
], Outputer, "createValue", null);
__decorate([
    Class.Private()
], Outputer, "createEntity", null);
__decorate([
    Class.Public()
], Outputer, "create", null);
__decorate([
    Class.Public()
], Outputer, "createArray", null);
__decorate([
    Class.Public()
], Outputer, "createMap", null);
__decorate([
    Class.Public()
], Outputer, "createFull", null);
__decorate([
    Class.Public()
], Outputer, "createFullArray", null);
__decorate([
    Class.Public()
], Outputer, "createFullMap", null);
Outputer = __decorate([
    Class.Describe()
], Outputer);
exports.Outputer = Outputer;
//# sourceMappingURL=outputer.js.map