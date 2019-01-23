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
/**
 * Copyright (C) 2018 Silas B. Domingos
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
        if (!schema_1.Schema.getStorage((this.model = model))) {
            throw new Error(`There is no storage name, make sure your entity model is valid.`);
        }
    }
    /**
     * Creates a new data model based on the specified entity model and data.
     * @param model Entity model.
     * @param data Entity data.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied or some read-only/write-only property was set wrongly.
     */
    static createModel(model, entity, input, fully) {
        const data = new model();
        const columns = schema_1.Schema.getRealRow(model);
        for (const name in columns) {
            const column = columns[name];
            const source = input ? column.name : column.alias || column.name;
            const target = input ? column.alias || column.name : column.name;
            if (source in entity && entity[source] !== void 0) {
                if (input && column.readonly) {
                    throw new Error(`The specified property ${target} is read-only.`);
                }
                else if (!input && column.writeonly) {
                    throw new Error(`The specified property ${target} is write-only.`);
                }
                else {
                    data[target] = this.getValueModel(column, entity[source], input, fully);
                }
            }
            else if (fully && column.required) {
                throw new Error(`Required column '${name}' for entity '${schema_1.Schema.getStorage(model)}' does not supplied.`);
            }
        }
        return data;
    }
    /**
     * Creates and get a new array of data model based on the specified entity model and values.
     * @param model Entity model.
     * @param values Entities list.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated list of entities based on entity model.
     */
    static getArrayModel(model, values, input, fully) {
        const list = [];
        for (const value of values) {
            list.push(this.createModel(model, value, input, fully));
        }
        return list;
    }
    /**
     * Creates and get a new map of data model based on the specified entity model and value.
     * @param model Entity model.
     * @param value Entity map.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines if all required properties must be provided.
     * @returns Returns the new generated map of entity data based on entity model.
     */
    static getMapModel(model, value, input, fully) {
        const map = {};
        for (const name in value) {
            map[name] = this.createModel(model, value[name], input, fully);
        }
        return map;
    }
    /**
     * Creates and get a new model value based on the specified entity model and data.
     * @param column Column schema.
     * @param value Value to be created.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new normalized value.
     */
    static getValueModel(column, value, input, fully) {
        if (column.model && !this.commons.includes(column.model)) {
            if (column.formats.includes(Types.Format.ARRAY)) {
                return this.getArrayModel(column.model, value, input, fully);
            }
            else if (column.formats.includes(Types.Format.MAP)) {
                return this.getMapModel(column.model, value, input, fully);
            }
            else {
                return this.createModel(column.model, value, input, fully);
            }
        }
        return value;
    }
    /**
     * Generates a new normalized array of entity data based on the specified entity model and values.
     * @param model Entity model.
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
     * Generates a new normalized map of entity data based on the specified entity model and value.
     * @param model Entity model.
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
     * Generates a new normalized value from the specified column schema and value.
     * @param column Column schema.
     * @param value Value to be normalized.
     * @returns Returns the new normalized value.
     */
    static normalizeValue(column, value) {
        if (column.model && !this.commons.includes(column.model)) {
            if (column.formats.includes(Types.Format.ARRAY)) {
                return this.normalizeArray(column.model, value);
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
     * Generates a new normalized entity data based on the specified entity model and data.
     * @param model Entity model
     * @param entity Entity data.
     * @returns Returns the new normalized entity data.
     */
    static normalize(model, entity) {
        const rColumns = schema_1.Schema.getRealRow(model);
        const vColumns = schema_1.Schema.getVirtualRow(model);
        const data = {};
        for (const name in entity) {
            const value = entity[name];
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
     * Gets the list of joined columns.
     * @returns Returns the virtual columns list.
     */
    getJoinedColumns() {
        const columns = schema_1.Schema.getVirtualRow(this.model);
        const list = [];
        if (columns) {
            for (const name in columns) {
                const column = columns[name];
                const local = schema_1.Schema.getRealColumn(this.model, column.local);
                const foreign = schema_1.Schema.getRealColumn(column.model, column.foreign);
                list.push({
                    local: local.alias || local.name,
                    foreign: foreign.alias || foreign.name,
                    virtual: column.name,
                    storage: schema_1.Schema.getStorage(column.model),
                    multiple: local.formats.includes(Types.Format.ARRAY)
                });
            }
        }
        return list;
    }
    /**
     * Assign all joined columns into the specified data model from the given entity.
     * @param data Target entity data.
     * @param entity Source entity.
     * @returns Returns the specified entity data.
     */
    assignJoinedColumns(data, entity) {
        const columns = schema_1.Schema.getVirtualRow(this.model);
        for (const name in columns) {
            if (name in entity) {
                data[name] = entity[name];
            }
        }
        return data;
    }
    /**
     * Creates a new data model based on the specified entity data.
     * @param entity Entity data.
     * @param input Determines whether the entity will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied.
     */
    createModel(entity, input, fully) {
        return Mapper_1.createModel(this.model, entity, input, fully);
    }
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @returns Returns the new normalized entity data.
     */
    normalize(entity) {
        return Mapper_1.normalize(this.model, entity);
    }
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entities list.
     * @returns Returns the list of normalized entities.
     */
    normalizeAll(...entities) {
        const list = [];
        for (const entity of entities) {
            list.push(this.normalize(entity));
        }
        return list;
    }
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entities list.
     * @returns Returns the map of normalized entities.
     */
    normalizeAsMap(...entities) {
        const column = schema_1.Schema.getPrimaryColumn(this.model);
        const map = {};
        if (!column) {
            throw new Error(`The specified data model has no primary column.`);
        }
        for (const entity of entities) {
            const normalized = this.normalize(entity);
            map[normalized[column.alias || column.name]] = normalized;
        }
        return map;
    }
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertMany(entities) {
        const list = [];
        for (const entity of entities) {
            list.push(this.createModel(entity, true, true));
        }
        return await this.driver.insert(this.model, list);
    }
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of inserted entry.
     */
    async insert(entity) {
        return (await this.insertMany([entity]))[0];
    }
    /**
     * Find the corresponding entity in the storage.
     * @param filters List of filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(filters, sort, limit) {
        const entities = await this.driver.find(this.model, this.getJoinedColumns(), filters, sort, limit);
        const results = [];
        for (const entity of entities) {
            results.push(this.assignJoinedColumns(this.createModel(entity, false, true), entity));
        }
        return results;
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(id) {
        const entity = await this.driver.findById(this.model, this.getJoinedColumns(), id);
        if (entity) {
            return this.assignJoinedColumns(this.createModel(entity, false, true), entity);
        }
        return void 0;
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(filter, entity) {
        return await this.driver.update(this.model, this.createModel(entity, true, false), filter);
    }
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity) {
        return await this.driver.updateById(this.model, this.createModel(entity, true, false), id);
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
/**
 * List of common types.
 */
Mapper.commons = [Object, String, Number, Boolean, Date];
__decorate([
    Class.Private()
], Mapper.prototype, "driver", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "model", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "getJoinedColumns", null);
__decorate([
    Class.Private()
], Mapper.prototype, "assignJoinedColumns", null);
__decorate([
    Class.Private()
], Mapper.prototype, "createModel", null);
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
], Mapper, "commons", void 0);
__decorate([
    Class.Private()
], Mapper, "createModel", null);
__decorate([
    Class.Private()
], Mapper, "getArrayModel", null);
__decorate([
    Class.Private()
], Mapper, "getMapModel", null);
__decorate([
    Class.Private()
], Mapper, "getValueModel", null);
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
    Class.Protected()
], Mapper, "normalize", null);
Mapper = Mapper_1 = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
