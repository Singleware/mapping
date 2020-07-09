"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inputer = void 0;
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Types = require("../types");
const Columns = require("../columns");
const helper_1 = require("../helper");
const schema_1 = require("../schema");
/**
 * Inputer helper class.
 */
let Inputer = class Inputer extends Class.Null {
    /**
     * Creates a new list based on the specified model type and entry list.
     * @param model Model type.
     * @param entries Entry list.
     * @param fields Fields to be included in the entity.
     * @param required Determines whether all required columns must be provided.
     * @param multiple Determines whether each value in the specified list can be a sub list.
     * @returns Returns the generated list.
     */
    static createArrayEntity(model, entries, fields, required, multiple) {
        const list = [];
        for (const entry of entries) {
            if (multiple && entry instanceof Array) {
                list.push(this.createArrayEntity(model, entry, fields, required, false));
            }
            else {
                list.push(this.createEntity(model, entry, fields, required));
            }
        }
        return list;
    }
    /**
     * Create a new map based on the specified model type and entry map.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Fields to be included in the entity.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated map.
     */
    static createMapEntity(model, entry, fields, required) {
        const map = {};
        for (const property in entry) {
            const entity = entry[property];
            if (entity !== void 0) {
                map[property] = this.createEntity(model, entity, fields, required);
            }
        }
        return map;
    }
    /**
     * Creates a new entity value from the specified column schema and entry value.
     * @param model Model type.
     * @param schema Column schema.
     * @param entry Entry value.
     * @param fields Fields to be included in the entity (if the values is an entity).
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the entity value.
     * @throws Throws an error when the expected value should be an array or map but the given value is not.
     */
    static createValue(model, schema, entry, fields, required) {
        if (schema.model && schema_1.Schema.isEntity(schema.model)) {
            const nestedFields = fields.length > 0 ? Columns.Helper.getNestedFields(schema, fields) : schema.fields || [];
            const nestedRequired = required && nestedFields.length === 0;
            const nestedModel = helper_1.Helper.getEntityModel(schema.model);
            if (entry instanceof Array) {
                if (schema.formats.includes(12 /* Array */)) {
                    const nestedMultiple = schema.all || false;
                    return this.createArrayEntity(nestedModel, entry, nestedFields, nestedRequired, nestedMultiple);
                }
                else {
                    throw new Error(`Input column '${schema.name}@${schema_1.Schema.getStorageName(model)}' doesn't support array types.`);
                }
            }
            else if (entry instanceof Object) {
                if (schema.formats.includes(14 /* Object */)) {
                    return this.createEntity(nestedModel, entry, nestedFields, nestedRequired);
                }
                else if (schema.formats.includes(13 /* Map */)) {
                    return this.createMapEntity(nestedModel, entry, nestedFields, nestedRequired);
                }
                else {
                    throw new Error(`Input column '${schema.name}@${schema_1.Schema.getStorageName(model)}' doesn't support object types.`);
                }
            }
        }
        return schema.caster(entry, "input" /* Input */);
    }
    /**
     * Creates a new entity based on the specified model type and entry.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Fields to be included in the entity.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated entity.
     * @throws Throws an error when required columns aren't supplied or read-only columns were set.
     */
    static createEntity(model, entry, fields, required) {
        const entity = new model();
        const columns = schema_1.Schema.getRealRow(model, ...fields);
        for (const name in columns) {
            const schema = columns[name];
            const value = entry[schema.name];
            if (value === void 0) {
                if (required && schema.required && !schema.readOnly) {
                    throw new Error(`Input column '${name}@${schema_1.Schema.getStorageName(model)}' wasn't given.`);
                }
            }
            else {
                if (schema.readOnly) {
                    throw new Error(`Input column '${name}@${schema_1.Schema.getStorageName(model)}' is read-only.`);
                }
                const result = this.createValue(model, schema, value, fields, required);
                if (result !== void 0) {
                    entity[name] = result;
                }
            }
        }
        return entity;
    }
    /**
     * Creates a new entity based on the specified model type and entry value.
     * @param model Model type.
     * @param entry Entry value.
     * @returns Returns the generated entity.
     */
    static create(model, entry) {
        return this.createEntity(model, entry, [], false);
    }
    /**
     * Creates a new entity array based on the specified model type and entry list.
     * @param model Model type.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createArray(model, entries) {
        return this.createArrayEntity(model, entries, [], false, false);
    }
    /**
     * Create a new entity map based on the specified model type and entry map.
     * @param model Model type.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createMap(model, entry) {
        return this.createMapEntity(model, entry, [], false);
    }
    /**
     * Creates a new full entity based on the specified model type and entry value.
     * @param model Model type.
     * @param entry Entry value.
     * @returns Returns the generated entity.
     */
    static createFull(model, data) {
        return this.createEntity(model, data, [], true);
    }
    /**
     * Creates a new full entity array based on the specified model type and entry list.
     * @param model Model type.
     * @param entries Entry list.
     * @returns Returns the generated entity array.
     */
    static createFullArray(model, entries) {
        return this.createArrayEntity(model, entries, [], true, false);
    }
    /**
     * Create a new full entity map based on the specified model type and entry map.
     * @param model Model type.
     * @param entry Entry map.
     * @returns Returns the generated entity map.
     */
    static createFullMap(model, entry) {
        return this.createMapEntity(model, entry, [], true);
    }
};
__decorate([
    Class.Private()
], Inputer, "createArrayEntity", null);
__decorate([
    Class.Private()
], Inputer, "createMapEntity", null);
__decorate([
    Class.Private()
], Inputer, "createValue", null);
__decorate([
    Class.Private()
], Inputer, "createEntity", null);
__decorate([
    Class.Public()
], Inputer, "create", null);
__decorate([
    Class.Public()
], Inputer, "createArray", null);
__decorate([
    Class.Public()
], Inputer, "createMap", null);
__decorate([
    Class.Public()
], Inputer, "createFull", null);
__decorate([
    Class.Public()
], Inputer, "createFullArray", null);
__decorate([
    Class.Public()
], Inputer, "createFullMap", null);
Inputer = __decorate([
    Class.Describe()
], Inputer);
exports.Inputer = Inputer;
//# sourceMappingURL=inputer.js.map