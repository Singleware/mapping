"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Mapper_1;
"use strict";
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Types = require("./types");
const schema_1 = require("./schema");
/**
 * Generic data mapper class.
 */
let Mapper = Mapper_1 = class Mapper extends Class.Null {
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     * @throws Throws an error when the model is a not valid entity.
     */
    constructor(driver, model) {
        super();
        this.driver = driver;
        this.model = model;
        if (!schema_1.Schema.isEntity(model)) {
            throw new Error(`The specified model isn't a valid entity model.`);
        }
    }
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
     * @param wanted Determines whether all properties are wanted by the upper entity.
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
     * @param multiple Determines whether the each value from the specified list is another list or not.
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
     * Converts the specified value into an entity when possible.
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
    /**
     * Creates a new entity based on the current model type, view mode and input data.
     * @param data Input data.
     * @param views View modes.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated entity or undefined when the entity is empty.
     */
    createEntity(data, views, input, full) {
        if (input) {
            return Mapper_1.createInputEntity(this.model, views, data, full);
        }
        else {
            return Mapper_1.createOutputEntity(this.model, views, data, true, full);
        }
    }
    /**
     * Creates a new list of entities based on the specified model type, view mode and data list.
     * @param list Data list.
     * @param views View modes.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated list of entities or undefined when the list is empty.
     */
    createEntityArray(list, views, input, full) {
        return Mapper_1.createEntityArray(this.model, views, list, input, full, false);
    }
    /**
     * Generate a new normalized entity based on the specified input data.
     * @param input Input data.
     * @returns Returns the new normalized entity data.
     */
    normalize(input) {
        return Mapper_1.normalize(this.model, input);
    }
    /**
     * Normalize all entities in the specified input list.
     * @param list Input list.
     * @returns Returns the list of normalized entities.
     */
    normalizeAll(...list) {
        return list.map((entity) => this.normalize(entity));
    }
    /**
     * Normalize all entities in the specified input list to a map of entities.
     * @param list Input list.
     * @returns Returns the map of normalized entities.
     */
    normalizeAsMap(...list) {
        const column = schema_1.Schema.getPrimaryColumn(this.model);
        const map = {};
        if (!column) {
            throw new Error(`The specified data model has no primary column.`);
        }
        for (const input of list) {
            const normalized = this.normalize(input);
            map[normalized[column.alias || column.name]] = normalized;
        }
        return map;
    }
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertMany(entities, views = [Types.View.ALL]) {
        return await this.driver.insert(this.model, views, this.createEntityArray(entities, views, true, true));
    }
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id of inserted entry.
     */
    async insert(entity, views = [Types.View.ALL]) {
        return (await this.insertMany([entity], views))[0];
    }
    /**
     * Find all corresponding entity in the storage.
     * @param filter Field filter.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(filter, views = [Types.View.ALL]) {
        return this.createEntityArray(await this.driver.find(this.model, views, filter), views, false, true);
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(id, views = [Types.View.ALL]) {
        const data = await this.driver.findById(this.model, views, id);
        return data ? this.createEntity(data, views, false, true) : void 0;
    }
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching fields.
     * @param entity Entity data to be updated.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(match, entity, views = [Types.View.ALL]) {
        const data = this.createEntity(entity, views, true, false);
        return data ? await this.driver.update(this.model, views, match, data) : 0;
    }
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity, views = [Types.View.ALL]) {
        const data = this.createEntity(entity, views, true, false);
        return data ? await this.driver.updateById(this.model, views, id, data) : false;
    }
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching fields.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(match) {
        return await this.driver.delete(this.model, match);
    }
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(id) {
        return await this.driver.deleteById(this.model, id);
    }
    /**
     * Count all corresponding entities from the storage.
     * @param filter Field filter.
     * @param views View modes.
     * @returns Returns a promise to get the total of found entities.
     */
    async count(filter, views = [Types.View.ALL]) {
        return await this.driver.count(this.model, views, filter);
    }
};
__decorate([
    Class.Private()
], Mapper.prototype, "model", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "driver", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "createEntity", null);
__decorate([
    Class.Private()
], Mapper.prototype, "createEntityArray", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "normalize", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "normalizeAll", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "normalizeAsMap", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "insertMany", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "insert", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "find", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "findById", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "update", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "updateById", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "delete", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "deleteById", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "count", null);
__decorate([
    Class.Private()
], Mapper, "createInputEntity", null);
__decorate([
    Class.Private()
], Mapper, "createOutputEntity", null);
__decorate([
    Class.Private()
], Mapper, "createEntityArray", null);
__decorate([
    Class.Private()
], Mapper, "createEntityMap", null);
__decorate([
    Class.Private()
], Mapper, "castValue", null);
__decorate([
    Class.Private()
], Mapper, "normalizeArray", null);
__decorate([
    Class.Private()
], Mapper, "normalizeMap", null);
__decorate([
    Class.Private()
], Mapper, "normalizeValue", null);
__decorate([
    Class.Public()
], Mapper, "normalize", null);
__decorate([
    Class.Public()
], Mapper, "isEmpty", null);
Mapper = Mapper_1 = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
