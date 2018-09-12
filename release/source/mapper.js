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
const schema_1 = require("./schema");
/**
 * Generic data mapper class.
 */
let Mapper = Mapper_1 = class Mapper {
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     * @throws Throws an error when the model is a not valid entity.
     */
    constructor(driver, model) {
        if (!schema_1.Schema.getStorage(model)) {
            throw new Error(`There is no storage name, make sure your entity model is a valid.`);
        }
        this.driver = driver;
        this.model = model;
    }
    /**
     * Gets the column name from the specified column schema.
     * @param column Column schema.
     * @returns Returns the column name.
     */
    getColumnName(column) {
        return column.alias || column.name;
    }
    /**
     * Gets the primary column name.
     * @returns Returns the primary column name.
     * @throws Throws an error when there is no primary column defined.
     */
    getPrimaryName() {
        const column = schema_1.Schema.getPrimary(this.model);
        if (!column) {
            throw new Error(`There is no primary column to be used.`);
        }
        return this.getColumnName(column);
    }
    /**
     * Gets the virtual columns list.
     * @returns Returns the virtual columns list.
     */
    getAggregations() {
        const columns = schema_1.Schema.getVirtual(this.model);
        const list = [];
        if (columns) {
            for (const name in columns) {
                const data = columns[name];
                const model = data.model || this.model;
                list.push({
                    storage: schema_1.Schema.getStorage(model),
                    local: data.local ? this.getColumnName(schema_1.Schema.getColumn(this.model, data.local)) : this.getPrimaryName(),
                    foreign: this.getColumnName(schema_1.Schema.getColumn(model, data.foreign)),
                    virtual: data.name
                });
            }
        }
        return list;
    }
    /**
     * Assign virtual columns into the specified data based on the given entity.
     * @param data Target entity data.
     * @param entity Source entity.
     * @returns Returns the specified entity data.
     */
    assignVirtual(data, entity) {
        const virtual = schema_1.Schema.getVirtual(this.model);
        for (const name in virtual) {
            if (name in entity) {
                data[name] = entity[name];
            }
        }
        return data;
    }
    /**
     * Creates a new model data based on the specified entity data.
     * @param entity Entity data.
     * @param input Determines whether the entity will be used for an input or output.
     * @param all Determines if all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied.
     */
    createModel(entity, input, all) {
        const data = new this.model();
        const row = schema_1.Schema.getRow(this.model);
        for (const name in row) {
            const column = this.getColumnName(row[name]);
            const source = input ? name : column;
            const target = input ? column : name;
            if (source in entity && entity[source] !== void 0) {
                data[target] = entity[source];
            }
            else if (all && row[name].required) {
                throw new Error(`Required column '${name}' does not supplied.`);
            }
        }
        return data;
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
        return await this.driver.insert(this.model, ...list);
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
     * @param filter Filter expression.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(filter) {
        const entities = await this.driver.find(this.model, filter, this.getAggregations());
        const results = [];
        for (const entity of entities) {
            results.push(this.assignVirtual(this.createModel(entity, false, true), entity));
        }
        return results;
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(id) {
        const entity = await this.driver.findById(this.model, id, this.getAggregations());
        return entity ? this.assignVirtual(this.createModel(entity, false, true), entity) : void 0;
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(filter, entity) {
        return await this.driver.update(this.model, filter, this.createModel(entity, true, false));
    }
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity) {
        return await this.driver.updateById(this.model, id, this.createModel(entity, true, false));
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
     * Generates a new normalized entity data based on the specified entity model and data.
     * @param model Entity model
     * @param entity Entity data.
     * @returns Returns the new normalized entity data.
     */
    static normalize(model, entity) {
        const columns = schema_1.Schema.getRow(model);
        const virtual = schema_1.Schema.getVirtual(model);
        const data = {};
        for (const name in entity) {
            const value = entity[name];
            if (name in columns) {
                const column = columns[name];
                if (!column.hidden) {
                    data[name] = column.model ? Mapper_1.normalize(column.model, value) : value;
                }
            }
            else if (name in virtual) {
                if (value instanceof Array) {
                    const list = [];
                    for (const entry of value) {
                        list.push(Mapper_1.normalize(virtual[name].model || model, entry));
                    }
                    data[name] = list;
                }
                else {
                    data[name] = Mapper_1.normalize(virtual[name].model || model, value);
                }
            }
        }
        return data;
    }
};
__decorate([
    Class.Private()
], Mapper.prototype, "driver", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "model", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "getColumnName", null);
__decorate([
    Class.Private()
], Mapper.prototype, "getPrimaryName", null);
__decorate([
    Class.Private()
], Mapper.prototype, "getAggregations", null);
__decorate([
    Class.Private()
], Mapper.prototype, "assignVirtual", null);
__decorate([
    Class.Private()
], Mapper.prototype, "createModel", null);
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
], Mapper.prototype, "normalize", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "normalizeAll", null);
__decorate([
    Class.Protected()
], Mapper, "normalize", null);
Mapper = Mapper_1 = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
