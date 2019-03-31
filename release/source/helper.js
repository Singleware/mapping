"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Types = require("./types");
const schema_1 = require("./schema");
/**
 * Helper class.
 */
let Helper = class Helper extends Class.Null {
    /**
     * Creates a new input entity based on the specified model type, view modes and the input data.
     * @param model Model type.
     * @param views View modes.
     * @param data Input data.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated entity.
     * @throws Throws an error when some required column was not supplied or some read-only property was set.
     */
    static createInputEntity(model, views, data, full) {
        const entity = new model();
        const row = schema_1.Schema.getRealRow(model, ...views);
        for (const name in row) {
            const schema = row[name];
            const source = schema.name;
            const target = schema.alias || schema.name;
            if (source in data && data[source] !== void 0) {
                if (schema.readOnly) {
                    throw new Error(`Column '${name}' in the entity '${schema_1.Schema.getStorage(model)}' is read-only.`);
                }
                else {
                    const converted = schema.converter ? schema.converter(data[source]) : data[source];
                    const casted = this.castValue(views, schema, converted, true, full);
                    if (casted !== void 0) {
                        entity[target] = casted;
                    }
                }
            }
            else if (full && schema.required && !schema.readOnly) {
                throw new Error(`Required column '${name}' in the entity '${schema_1.Schema.getStorage(model)}' was not given.`);
            }
        }
        return entity;
    }
    /**
     * Creates a new output entity based on the specified model type, view modes and the output data.
     * @param model Model type.
     * @param views View modes.
     * @param data Output data.
     * @param full Determines whether all required properties must be provided.
     * @param wanted Determines whether all properties are wanted by the parent entity.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when some required column was not supplied or some write-only property was set.
     */
    static createOutputEntity(model, views, data, full, wanted) {
        const required = [];
        const entity = new model();
        const rows = { ...schema_1.Schema.getRealRow(model, ...views), ...schema_1.Schema.getVirtualRow(model, ...views) };
        let empty = true;
        for (const name in rows) {
            const schema = rows[name];
            const source = schema.alias || schema.name;
            const target = schema.name;
            if (source in data && data[source] !== void 0) {
                if (schema.writeOnly) {
                    throw new Error(`Column '${name}' in the entity '${schema_1.Schema.getStorage(model)}' is write-only.`);
                }
                else {
                    const converted = schema.converter ? schema.converter(data[source]) : data[source];
                    const casted = this.castValue(views, schema, converted, false, full);
                    if (casted !== void 0 && casted !== null && (wanted || !empty || !this.isEmpty(casted))) {
                        entity[target] = casted;
                        empty = false;
                    }
                }
            }
            else if (full && schema.required && !schema.writeOnly) {
                required.push(name);
            }
        }
        if (empty) {
            return void 0;
        }
        else if (required.length) {
            throw new Error(`Required column(s) '${required.join(',')}' in the entity '${schema_1.Schema.getStorage(model)}' was not given.`);
        }
        return entity;
    }
    /**
     * Creates a new list of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new generated list of entities.
     */
    static createEntityArray(model, views, list, input, full, multiple) {
        const entities = [];
        for (const data of list) {
            let entity;
            if (multiple && data instanceof Array) {
                entity = this.createEntityArray(model, views, data, input, full, false);
            }
            else if (input) {
                entity = this.createInputEntity(model, views, data, full);
            }
            else {
                entity = this.createOutputEntity(model, views, data, full, false);
            }
            if (entity !== void 0) {
                entities.push(entity);
            }
        }
        return entities;
    }
    /**
     * Create a new map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated map of entities.
     */
    static createEntityMap(model, views, map, input, full) {
        const entities = {};
        for (const name in map) {
            const entity = input ? this.createInputEntity(model, views, map[name], full) : this.createOutputEntity(model, views, map[name], full, false);
            if (entity !== void 0) {
                entities[name] = entity;
            }
        }
        return entities;
    }
    /**
     * Converts the specified value to an entity when possible.
     * @param views View modes.
     * @param schema Column schema.
     * @param value Value to be converted.
     * @param input Determines whether the value will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the original or the converted value.
     */
    static castValue(views, schema, value, input, full) {
        if (schema.model && schema_1.Schema.isEntity(schema.model)) {
            if (schema.formats.includes(Types.Format.ARRAY)) {
                return this.createEntityArray(schema.model, views, value, input, full, schema.all);
            }
            else if (schema.formats.includes(Types.Format.MAP)) {
                return this.createEntityMap(schema.model, views, value, input, full);
            }
            else if (input) {
                return this.createInputEntity(schema.model, views, value, full);
            }
            else {
                return this.createOutputEntity(schema.model, views, value, full, schema.required && schema.type === 'real');
            }
        }
        return value;
    }
    /**
     * Generates a new normalized list of data based on the specified model type and list of entities.
     * @param model Model type.
     * @param list List od entities.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new normalized list of data.
     */
    static normalizeArray(model, list, multiple) {
        const data = [];
        for (const entity of list) {
            if (multiple && entity instanceof Array) {
                data.push(this.normalizeArray(model, entity, false));
            }
            else {
                data.push(this.normalize(model, entity));
            }
        }
        return data;
    }
    /**
     * Generates a new normalized map of data based on the specified model type and map of entities.
     * @param model Model type.
     * @param map Map of entities.
     * @returns Returns the new normalized map of data.
     */
    static normalizeMap(model, map) {
        const data = {};
        for (const name in map) {
            data[name] = this.normalize(model, map[name]);
        }
        return data;
    }
    /**
     * Generates a new normalized value from the specified value and column schema.
     * @param column Column schema.
     * @param value Value to be normalized.
     * @returns Returns the new normalized value.
     */
    static normalizeValue(column, value) {
        if (column.model && schema_1.Schema.isEntity(column.model)) {
            if (column.formats.includes(Types.Format.ARRAY)) {
                return this.normalizeArray(column.model, value, column.all);
            }
            else if (column.formats.includes(Types.Format.MAP)) {
                return this.normalizeMap(column.model, value);
            }
            else {
                return this.normalize(column.model, value);
            }
        }
        return value;
    }
    /**
     * Generates a new normalized entity data based on the specified model type and input data.
     * @param model Model type.
     * @param input Input data.
     * @returns Returns the new normalized entity data.
     */
    static normalize(model, input) {
        const rows = { ...schema_1.Schema.getRealRow(model, Types.View.ALL), ...schema_1.Schema.getVirtualRow(model, Types.View.ALL) };
        const data = {};
        for (const name in input) {
            const value = input[name];
            const schema = rows[name];
            if (value !== void 0 && schema !== void 0 && !schema.hidden) {
                data[name] = this.normalizeValue(schema, value);
            }
        }
        return data;
    }
    /**
     * Determines whether the specified value is empty or not.
     * @param value Value to be checked.
     * @returns Returns true when the specified value is empty or false otherwise.
     */
    static isEmpty(value) {
        if (value instanceof Array) {
            return value.length === 0;
        }
        else if (value instanceof Object) {
            return !schema_1.Schema.isEntity(value) && Object.keys(value).length === 0;
        }
        else {
            return value === void 0 || value === null;
        }
    }
};
__decorate([
    Class.Private()
], Helper, "createInputEntity", null);
__decorate([
    Class.Private()
], Helper, "createOutputEntity", null);
__decorate([
    Class.Private()
], Helper, "createEntityArray", null);
__decorate([
    Class.Private()
], Helper, "createEntityMap", null);
__decorate([
    Class.Private()
], Helper, "castValue", null);
__decorate([
    Class.Private()
], Helper, "normalizeArray", null);
__decorate([
    Class.Private()
], Helper, "normalizeMap", null);
__decorate([
    Class.Private()
], Helper, "normalizeValue", null);
__decorate([
    Class.Public()
], Helper, "normalize", null);
__decorate([
    Class.Public()
], Helper, "isEmpty", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
