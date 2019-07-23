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
const Types = require("./types");
const schema_1 = require("./schema");
/**
 * Entity helper class.
 */
let Entity = class Entity extends Class.Null {
    /**
     * Converts the specified input value to an entity, if possible.
     * @param column Column schema.
     * @param value Value to be converted.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the original or the converted value.
     */
    static createInputValue(column, value, full) {
        if (!column.model || !schema_1.Schema.isEntity(column.model)) {
            return value;
        }
        else if (column.formats.includes(Types.Format.ARRAY)) {
            if (!(value instanceof Array)) {
                const name = column.alias || column.name;
                throw new TypeError(`Column '${name}' in the model '${schema_1.Schema.getStorage(column.model)}' must be an array.`);
            }
            else {
                return this.createInputArrayEntity(column.model, value, full, column.all);
            }
        }
        else if (column.formats.includes(Types.Format.MAP)) {
            if (!(value instanceof Object)) {
                const name = column.alias || column.name;
                throw new TypeError(`Column '${name}' in the model '${schema_1.Schema.getStorage(column.model)}' must be an map.`);
            }
            else {
                return this.createInputMapEntity(column.model, value, full);
            }
        }
        else {
            return this.createInputEntity(column.model, value, full);
        }
    }
    /**
     * Converts the specified output value to an entity, if possible.
     * @param views View modes.
     * @param column Column schema.
     * @param value Value to be converted.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the original or the converted value.
     */
    static createOutputValue(views, column, value, full) {
        if (!column.model || !schema_1.Schema.isEntity(column.model)) {
            return value;
        }
        else if (column.formats.includes(Types.Format.ARRAY)) {
            if (!(value instanceof Array)) {
                const name = column.alias || column.name;
                throw new TypeError(`Column '${name}' in the model '${schema_1.Schema.getStorage(column.model)}' must be an array.`);
            }
            else {
                return this.createOutputArrayEntity(column.model, views, value, full, column.all);
            }
        }
        else if (column.formats.includes(Types.Format.MAP)) {
            if (!(value instanceof Object)) {
                const name = column.alias || column.name;
                throw new TypeError(`Column '${name}' in the model '${schema_1.Schema.getStorage(column.model)}' must be an map.`);
            }
            else {
                return this.createOutputMapEntity(column.model, views, value, full);
            }
        }
        else {
            return this.createOutputEntity(column.model, views, value, full, column.required && column.type === 'real');
        }
    }
    /**
     * Creates a new input entity based on the specified model type and the input data.
     * @param model Model type.
     * @param data Input data.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated entity.
     * @throws Throws an error when some required column was not supplied or some read-only property was set.
     */
    static createInputEntity(model, data, full) {
        const entity = new model();
        const row = schema_1.Schema.getRealRow(model);
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
                    const value = this.createInputValue(schema, converted, full);
                    if (value !== void 0) {
                        entity[target] = value;
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
                    const value = this.createOutputValue(views, schema, converted, full);
                    if (value !== void 0 && value !== null && (wanted || !empty || !this.isEmpty(value))) {
                        entity[target] = value;
                        empty = false;
                    }
                }
            }
            else if (full && schema.required && !schema.writeOnly) {
                required.push(name);
            }
        }
        if (empty && !wanted) {
            return void 0;
        }
        if (required.length) {
            throw new Error(`Required column(s) '${required.join(', ')}' in the entity '${schema_1.Schema.getStorage(model)}' was not given.`);
        }
        return entity;
    }
    /**
     * Creates a new input array of entities based on the specified model type and the list of data.
     * @param model Model type.
     * @param list List of data.
     * @param full Determines whether all required properties must be provided.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new generated list of entities.
     */
    static createInputArrayEntity(model, list, full, multiple) {
        const entities = [];
        for (const data of list) {
            let entity;
            if (multiple && data instanceof Array) {
                entity = this.createInputArrayEntity(model, data, full, false);
            }
            else {
                entity = this.createInputEntity(model, data, full);
            }
            if (entity !== void 0) {
                entities.push(entity);
            }
        }
        return entities;
    }
    /**
     * Creates a new output array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @param full Determines whether all required properties must be provided.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new generated list of entities.
     */
    static createOutputArrayEntity(model, views, list, full, multiple) {
        const entities = [];
        for (const data of list) {
            let entity;
            if (multiple && data instanceof Array) {
                entity = this.createOutputArrayEntity(model, views, data, full, false);
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
     * Create a new input map of entities based on the specified model type and the map of data.
     * @param model Model type.
     * @param map Map of data.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated map of entities.
     */
    static createInputMapEntity(model, map, full) {
        const entities = {};
        for (const name in map) {
            const entity = this.createInputEntity(model, map[name], full);
            if (entity !== void 0) {
                entities[name] = entity;
            }
        }
        return entities;
    }
    /**
     * Create a new output map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the generated map of entities.
     */
    static createOutputMapEntity(model, views, map, full) {
        const entities = {};
        for (const name in map) {
            const entity = this.createOutputEntity(model, views, map[name], full, false);
            if (entity !== void 0) {
                entities[name] = entity;
            }
        }
        return entities;
    }
    /**
     * Generates a new normalized list of data based on the specified model type and the list of entities.
     * @param model Model type.
     * @param list List of entities.
     * @param multiple Determines whether each value from the specified list is another list or not.
     * @returns Returns the new normalized list of data.
     */
    static normalizeArray(model, list, multiple) {
        const entity = [];
        for (const item of list) {
            if (multiple && item instanceof Array) {
                entity.push(this.normalizeArray(model, item, false));
            }
            else {
                entity.push(this.normalize(model, item));
            }
        }
        return entity;
    }
    /**
     * Generates a new normalized map based on the specified model type and map of entities.
     * @param model Model type.
     * @param map Map of entities.
     * @returns Returns the new normalized map of data.
     */
    static normalizeMap(model, map) {
        const entity = {};
        for (const name in map) {
            entity[name] = this.normalize(model, map[name]);
        }
        return entity;
    }
    /**
     * Generates a new normalized value from the specified column schema and input value.
     * @param column Column schema.
     * @param value Input value.
     * @returns Returns the new normalized value or the original value when it doesn't need to be normalized.
     */
    static normalizeValue(column, value) {
        if (!column.model || !schema_1.Schema.isEntity(column.model)) {
            return value;
        }
        else if (column.formats.includes(Types.Format.ARRAY)) {
            if (!(value instanceof Array)) {
                const name = column.alias || column.name;
                throw new TypeError(`Column '${name}' in the entity '${schema_1.Schema.getStorage(column.model)}' must be an array.`);
            }
            else {
                return this.normalizeArray(column.model, value, column.all);
            }
        }
        else if (column.formats.includes(Types.Format.MAP)) {
            if (!(value instanceof Object)) {
                const name = column.alias || column.name;
                throw new TypeError(`Column '${name}' in the entity '${schema_1.Schema.getStorage(column.model)}' must be a map.`);
            }
            else {
                return this.normalizeMap(column.model, value);
            }
        }
        else {
            return this.normalize(column.model, value);
        }
    }
    /**
     * Creates a new input entity based on the specified model type and the input data.
     * @param model Model type.
     * @param data Input data.
     * @returns Returns the generated entity.
     * @throws Throws an error when some required column was not supplied or some read-only property was set.
     */
    static createInput(model, data) {
        return this.createInputEntity(model, data, false);
    }
    /**
     * Creates a new full input entity based on the specified model type and the input data.
     * @param model Model type.
     * @param data Input data.
     * @returns Returns the generated entity.
     * @throws Throws an error when some required column was not supplied or some read-only property was set.
     */
    static createFullInput(model, data) {
        return this.createInputEntity(model, data, true);
    }
    /**
     * Creates a new output entity based on the specified model type, view modes and the output data.
     * @param model Model type.
     * @param views View modes.
     * @param data Output data.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when some required column was not supplied or some write-only property was set.
     */
    static createOutput(model, views, data) {
        return this.createOutputEntity(model, views, data, false, true);
    }
    /**
     * Creates a new full output entity based on the specified model type, view modes and the output data.
     * @param model Model type.
     * @param views View modes.
     * @param data Output data.
     * @returns Returns the generated entity or undefined when the entity has no data.
     * @throws Throws an error when some required column was not supplied or some write-only property was set.
     */
    static createFullOutput(model, views, data) {
        return this.createOutputEntity(model, views, data, true, true);
    }
    /**
     * Creates a new input array of entities based on the specified model type and the list of data.
     * @param model Model type.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createInputArray(model, list) {
        return this.createInputArrayEntity(model, list, false, false);
    }
    /**
     * Creates a new full input array of entities based on the specified model type and the list of data.
     * @param model Model type.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createFullInputArray(model, list) {
        return this.createInputArrayEntity(model, list, true, false);
    }
    /**
     * Creates a new output array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createOutputArray(model, views, list) {
        return this.createOutputArrayEntity(model, views, list, false, false);
    }
    /**
     * Creates a new full output array of entities based on the specified model type, view modes and the list of data.
     * @param model Model type.
     * @param views View modes.
     * @param list List of data.
     * @returns Returns the new generated list of entities.
     */
    static createFullOutputArray(model, views, list) {
        return this.createOutputArrayEntity(model, views, list, true, false);
    }
    /**
     * Create a new input map of entities based on the specified model type and the map of data.
     * @param model Model type.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createInputMap(model, map) {
        return this.createInputMapEntity(model, map, false);
    }
    /**
     * Create a new full input map of entities based on the specified model type and the map of data.
     * @param model Model type.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createFullInputMap(model, map) {
        return this.createInputMapEntity(model, map, true);
    }
    /**
     * Create a new output map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createOutputMap(model, views, map) {
        return this.createOutputMapEntity(model, views, map, false);
    }
    /**
     * Create a new full output map of entities based on the specified model type, view modes and the map of data.
     * @param model Model type.
     * @param views View modes.
     * @param map Map of data.
     * @returns Returns the generated map of entities.
     */
    static createFullOutputMap(model, views, map) {
        return this.createOutputMapEntity(model, views, map, true);
    }
    /**
     * Generates a new normalized entity based on the specified model type and input data.
     * @param model Model type.
     * @param data Input data.
     * @returns Returns the new normalized entity data.
     */
    static normalize(model, data) {
        const rows = { ...schema_1.Schema.getRealRow(model), ...schema_1.Schema.getVirtualRow(model) };
        const entity = {};
        for (const name in data) {
            const value = data[name];
            const column = rows[name];
            if (value !== void 0 && column !== void 0 && !column.hidden) {
                entity[name] = this.normalizeValue(column, value);
            }
        }
        return entity;
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
], Entity, "createInputValue", null);
__decorate([
    Class.Private()
], Entity, "createOutputValue", null);
__decorate([
    Class.Private()
], Entity, "createInputEntity", null);
__decorate([
    Class.Private()
], Entity, "createOutputEntity", null);
__decorate([
    Class.Private()
], Entity, "createInputArrayEntity", null);
__decorate([
    Class.Private()
], Entity, "createOutputArrayEntity", null);
__decorate([
    Class.Private()
], Entity, "createInputMapEntity", null);
__decorate([
    Class.Private()
], Entity, "createOutputMapEntity", null);
__decorate([
    Class.Private()
], Entity, "normalizeArray", null);
__decorate([
    Class.Private()
], Entity, "normalizeMap", null);
__decorate([
    Class.Private()
], Entity, "normalizeValue", null);
__decorate([
    Class.Public()
], Entity, "createInput", null);
__decorate([
    Class.Public()
], Entity, "createFullInput", null);
__decorate([
    Class.Public()
], Entity, "createOutput", null);
__decorate([
    Class.Public()
], Entity, "createFullOutput", null);
__decorate([
    Class.Public()
], Entity, "createInputArray", null);
__decorate([
    Class.Public()
], Entity, "createFullInputArray", null);
__decorate([
    Class.Public()
], Entity, "createOutputArray", null);
__decorate([
    Class.Public()
], Entity, "createFullOutputArray", null);
__decorate([
    Class.Public()
], Entity, "createInputMap", null);
__decorate([
    Class.Public()
], Entity, "createFullInputMap", null);
__decorate([
    Class.Public()
], Entity, "createOutputMap", null);
__decorate([
    Class.Public()
], Entity, "createFullOutputMap", null);
__decorate([
    Class.Public()
], Entity, "normalize", null);
__decorate([
    Class.Public()
], Entity, "isEmpty", null);
Entity = __decorate([
    Class.Describe()
], Entity);
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map