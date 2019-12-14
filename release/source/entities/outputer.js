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
     * Creates a new list based on the specified model type, entry list and viewed fields.
     * @param model Model type.
     * @param entries Entry list.
     * @param multiple Determines whether each value in the specified list can be a sub list.
     * @param required Determines whether all required columns must be provided.
     * @param fields Viewed fields.
     * @returns Returns the generated list.
     */
    static createArrayEntity(model, entries, multiple, required, fields) {
        const list = [];
        for (const entry of entries) {
            let entity;
            if (multiple && entry instanceof Array) {
                entity = this.createArrayEntity(model, entry, false, required, fields);
            }
            else {
                entity = this.createEntity(model, entry, fields, required, false);
            }
            if (entity !== void 0) {
                list.push(entity);
            }
        }
        return list;
    }
    /**
     * Create a new entity map based on the specified model type, entry map and viewed fields.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Viewed fields.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the generated entity map.
     */
    static createMapEntity(model, entry, fields, required) {
        const map = {};
        for (const property in entry) {
            const entity = this.createEntity(model, entry[property], fields, required, false);
            if (entity !== void 0) {
                map[property] = entity;
            }
        }
        return map;
    }
    /**
     * Creates a new entry value from the specified column schema, entity value and viewed fields.
     * @param model Model type.
     * @param schema Column schema.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @param required Determines whether all required columns must be provided.
     * @returns Returns the original or the converted value.
     * @throws Throws an error when the expected value should be an array or map but the given value is not.
     */
    static createValue(model, schema, entry, fields, required) {
        if (schema.model && schema_1.Schema.isEntity(schema.model)) {
            if (entry instanceof Array) {
                if (schema.formats.includes(12 /* Array */)) {
                    return this.createArrayEntity(schema_1.Schema.getEntityModel(schema.model), entry, schema.all || false, required, fields);
                }
                else {
                    throw new TypeError(`Output column '${schema.name}@${schema_1.Schema.getStorageName(model)}' doesn't support array types.`);
                }
            }
            else if (entry instanceof Object) {
                if (schema.formats.includes(14 /* Object */)) {
                    return this.createEntity(schema_1.Schema.getEntityModel(schema.model), entry, fields, required, (schema.required || false) && schema.type === "real" /* Real */);
                }
                else if (schema.formats.includes(13 /* Map */)) {
                    return this.createMapEntity(schema_1.Schema.getEntityModel(schema.model), entry, fields, required);
                }
                else {
                    throw new TypeError(`Output column '${schema.name}@${schema_1.Schema.getStorageName(model)}' doesn't support object types.`);
                }
            }
        }
        return schema.caster(entry, "output" /* Output */);
    }
    /**
     * Creates a new entity based on the specified model type, entry value and viewed fields.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @param required Determines whether all required columns must be provided.
     * @param wanted Determines whether all columns are wanted by the parent entity.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when required columns aren't supplied or write-only columns were set.
     */
    static createEntity(model, entry, fields, required, wanted) {
        const columns = { ...schema_1.Schema.getRealRow(model, ...fields), ...schema_1.Schema.getVirtualRow(model, ...fields) };
        const entity = new model();
        const missing = [];
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
                const result = this.createValue(model, schema, value, fields, required);
                if (result !== void 0) {
                    entity[name] = result;
                }
            }
        }
        if (!wanted && schema_1.Schema.isEmpty(model, entity, 0)) {
            return void 0;
        }
        if (missing.length) {
            throw new Error(`Output column '[${missing.join(',')}]@${schema_1.Schema.getStorageName(model)}' wasn't given.`);
        }
        return entity;
    }
    /**
     * Creates a new entity based on the specified model type, entry value and viewed fields.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static create(model, entry, fields) {
        return this.createEntity(model, entry, fields, false, true);
    }
    /**
     * Creates a new entity array based on the specified model type, entry list and viewed fields.
     * @param model Model type.
     * @param entries Entry list.
     * @param fields Viewed fields.
     * @returns Returns the generated entity array.
     */
    static createArray(model, entries, fields) {
        return this.createArrayEntity(model, entries, false, false, fields);
    }
    /**
     * Create a new entity map based on the specified model type, entry map and viewed fields.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Viewed fields.
     * @returns Returns the generated entity map.
     */
    static createMap(model, entry, fields) {
        return this.createMapEntity(model, entry, fields, false);
    }
    /**
     * Creates a new full entity based on the specified model type, entry value and viewed fields.
     * @param model Model type.
     * @param entry Entry value.
     * @param fields Viewed fields.
     * @returns Returns the generated entity or undefined when the entity has no data.
     */
    static createFull(model, entry, fields) {
        return this.createEntity(model, entry, fields, true, true);
    }
    /**
     * Creates a new full entity array based on the specified model type, entry list and viewed fields.
     * @param model Model type.
     * @param entries Entry list.
     * @param fields Viewed fields.
     * @returns Returns the generated entity array.
     */
    static createFullArray(model, entries, fields) {
        return this.createArrayEntity(model, entries, false, true, fields);
    }
    /**
     * Create a new full entity map based on the specified model type, entry map and viewed fields.
     * @param model Model type.
     * @param entry Entry map.
     * @param fields Viewed fields.
     * @returns Returns the generated entity map.
     */
    static createFullMap(model, entry, fields) {
        return this.createMapEntity(model, entry, fields, true);
    }
};
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