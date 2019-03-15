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
     * Creates a new entity based on the specified model type, view mode and input data.
     * @param model Model type.
     * @param view View mode.
     * @param data Input data.
     * @param input Determines whether data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated entity based on the model type.
     * @throws Throws an error when some required column was not supplied or some read-only/write-only property was set wrongly.
     */
    static createEntity(model, view, data, input, full) {
        const entity = new model();
        const storage = schema_1.Schema.getStorage(model);
        const columns = schema_1.Schema.getRealRow(model, view);
        for (const column in columns) {
            const schema = columns[column];
            const source = input ? schema.name : schema.alias || schema.name;
            const target = input ? schema.alias || schema.name : schema.name;
            if (source in data && data[source] !== void 0) {
                if (input && schema.readOnly) {
                    throw new Error(`Column '${column}' in the '${view}' view of the entity '${storage}' is read-only.`);
                }
                else if (!input && schema.writeOnly) {
                    throw new Error(`Column '${column}' in the '${view}' view of the entity '${storage}' is write-only.`);
                }
                else {
                    const value = schema.converter ? schema.converter(data[source]) : data[source];
                    entity[target] = this.castValue(schema, view, value, input, full);
                }
            }
            else if (full && schema.required && ((!input && !schema.writeOnly) || (input && !schema.readOnly))) {
                throw new Error(`Column '${column}' in the '${view}' of the entity '${storage}' is required.`);
            }
        }
        return entity;
    }
    /**
     * Creates a new list of entities based on the specified model type, view mode and the list of data.
     * @param model Model type.
     * @param view View mode.
     * @param list List of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated list of entities based on the model type.
     */
    static createEntityArray(model, view, list, input, full) {
        const entities = [];
        for (const data of list) {
            entities.push(this.createEntity(model, view, data, input, full));
        }
        return entities;
    }
    /**
     * Create a new map of entities based on the specified model type, view mode and map of data.
     * @param model Model type.
     * @param view View mode.
     * @param map Map of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated map of entities based on the model type.
     */
    static createEntityMap(model, view, map, input, full) {
        const entities = {};
        for (const name in map) {
            entities[name] = this.createEntity(model, view, map[name], input, full);
        }
        return entities;
    }
    /**
     * Check whether the specified value can be converted to an entity.
     * @param real Real column schema.
     * @param view View mode.
     * @param value Value to be converted.
     * @param input Determines whether the value will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the original or the converted value.
     */
    static castValue(real, view, value, input, full) {
        if (real.model && schema_1.Schema.isEntity(real.model)) {
            if (real.formats.includes(Types.Format.ARRAY)) {
                return this.createEntityArray(real.model, view, value, input, full);
            }
            else if (real.formats.includes(Types.Format.MAP)) {
                return this.createEntityMap(real.model, view, value, input, full);
            }
            else {
                return this.createEntity(real.model, view, value, input, full);
            }
        }
        return value;
    }
    /**
     * Generates a new normalized array of entities data based on the specified model type and input values.
     * @param model Model type.
     * @param values Entities list.
     * @returns Returns the new normalized list of entities.
     */
    static normalizeArray(model, values) {
        const list = [];
        for (const value of values) {
            list.push(this.normalize(model, value));
        }
        return list;
    }
    /**
     * Generates a new normalized map of entities data based on the specified model type and value.
     * @param model Model type.
     * @param value Entity map.
     * @returns Returns the new normalized map of entities.
     */
    static normalizeMap(model, value) {
        const map = {};
        for (const name in value) {
            map[name] = this.normalize(model, value[name]);
        }
        return map;
    }
    /**
     * Generates a new normalized value from the specified real column schema and value.
     * @param real Real column schema.
     * @param value Value to be normalized.
     * @returns Returns the new normalized value.
     */
    static normalizeValue(real, value) {
        if (real.model && schema_1.Schema.isEntity(real.model)) {
            if (real.formats.includes(Types.Format.ARRAY)) {
                return this.normalizeArray(real.model, value);
            }
            else if (real.formats.includes(Types.Format.MAP)) {
                return this.normalizeMap(real.model, value);
            }
            else {
                return this.normalize(real.model, value);
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
        const rColumns = schema_1.Schema.getRealRow(model, Types.View.ALL);
        const vColumns = schema_1.Schema.getVirtualRow(model, Types.View.ALL);
        const data = {};
        for (const name in input) {
            const value = input[name];
            if (value !== void 0) {
                if (name in rColumns) {
                    if (!rColumns[name].hidden) {
                        data[name] = this.normalizeValue(rColumns[name], value);
                    }
                }
                else if (name in vColumns) {
                    if (value instanceof Array) {
                        data[name] = this.normalizeArray(vColumns[name].model || model, value);
                    }
                    else {
                        data[name] = this.normalize(vColumns[name].model || model, value);
                    }
                }
            }
        }
        return data;
    }
    /**
     * Creates a new entity based on the current model type, view mode and input data.
     * @param view View mode.
     * @param data Input data.
     * @param input Determines whether the data will be used for an input or output.
     * @param full Determines whether all required properties must be provided.
     * @returns Returns the new generated entity.
     */
    createEntity(view, data, input, full) {
        return Mapper_1.createEntity(this.model, view, data, input, full);
    }
    /**
     * Assign to the given target all virtual columns joined into the specified source.
     * @param view View mode.
     * @param target Target data.
     * @param source Source entity.
     * @returns Returns the specified target data.
     */
    assignVirtualColumns(view, target, source) {
        const columns = schema_1.Schema.getVirtualRow(this.model, view);
        for (const name in columns) {
            if (name in source) {
                target[name] = source[name];
            }
        }
        return target;
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
        const entities = [];
        for (const input of list) {
            entities.push(this.normalize(input));
        }
        return entities;
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
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertMany(view, entities) {
        return await this.driver.insert(this.model, view, entities.map((entity) => this.createEntity(view, entity, true, true)));
    }
    /**
     * Insert the specified entity into the storage.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of inserted entry.
     */
    async insert(view, entity) {
        return await this.driver.insert(this.model, view, [this.createEntity(view, entity, true, true)]);
    }
    /**
     * Find the corresponding entity in the storage.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param filter Field filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(view, filter, sort, limit) {
        return (await this.driver.find(this.model, view, filter, sort, limit)).map((entity) => this.assignVirtualColumns(view, this.createEntity(view, entity, false, true), entity));
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param id Entity id.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(view, id) {
        const entity = await this.driver.findById(this.model, view, id);
        if (entity) {
            return this.assignVirtualColumns(view, this.createEntity(view, entity, false, true), entity);
        }
        return void 0;
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param view Entity view.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(view, filter, entity) {
        return await this.driver.update(this.model, view, this.createEntity(view, entity, true, false), filter);
    }
    /**
     * Update a entity that corresponds to the specified id.
     * @param view Entity view, use Types.View.ALL to all fields.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(view, id, entity) {
        return await this.driver.updateById(this.model, view, this.createEntity(view, entity, true, false), id);
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param filter Filter columns.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(filter) {
        return await this.driver.delete(this.model, filter);
    }
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(id) {
        return await this.driver.deleteById(this.model, id);
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
], Mapper.prototype, "assignVirtualColumns", null);
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
    Class.Private()
], Mapper, "createEntity", null);
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
Mapper = Mapper_1 = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
