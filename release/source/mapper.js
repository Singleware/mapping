"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const schema_1 = require("./schema");
/**
 * Generic data mapper class.
 */
let Mapper = class Mapper {
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     */
    constructor(driver, model) {
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
        const column = schema_1.Schema.getPrimaryColumn(this.model);
        if (!column) {
            throw new Error(`There is no primary column to be used.`);
        }
        return this.getColumnName(column);
    }
    /**
     * Gets the storage name.
     * @returns Returns the storage name.
     * @throws Throws an error when the storage name was not defined.
     */
    getStorageName() {
        const name = schema_1.Schema.getStorageName(this.model);
        if (!name) {
            throw new Error(`There is no storage name, make sure your entity model is a valid.`);
        }
        return name;
    }
    /**
     * Gets a new entity based on the specified entity model.
     * @param entity Entity data.
     * @param input Determines whether the entity will be used for input or output.
     * @param all Determines if all required properties must be provided.
     * @returns Returns the new generated entity data based on entity model.
     * @throws Throws an error when a required column is not supplied.
     */
    getEntity(entity, input, all) {
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
     * Gets a new list of entities based on the specified entity model.
     * @param entities Entities list.
     * @param input Determines whether the entities will be used for an input or output.
     * @param all Determines whether all properties must be provided.
     * @returns Returns the new entities list.
     */
    getEntities(entities, input, all) {
        const list = [];
        for (const entity of entities) {
            list.push(this.getEntity(entity, input, all));
        }
        return list;
    }
    /**
     * Generate a new normalized entity based on the specified entity model.
     * @param entity Entity data.
     * @returns Returns the new generated entity data.
     */
    normalize(entity) {
        const schema = schema_1.Schema.getRow(this.model);
        const data = {};
        for (const column in entity) {
            if (column in schema && !schema[column].hidden) {
                data[column] = entity[column];
            }
        }
        return data;
    }
    /**
     * Insert the specified entities list into the storage.
     * @param entities Entities list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertMany(entities) {
        return await this.driver.insert(this.getStorageName(), ...this.getEntities(entities, true, true));
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
        return await this.getEntities(await this.driver.find(this.getStorageName(), filter), false, true);
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(id) {
        const entity = await this.driver.findById(this.getStorageName(), this.getPrimaryName(), id);
        if (entity) {
            return await this.getEntity(entity, false, true);
        }
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(filter, entity) {
        return await this.driver.update(this.getStorageName(), filter, this.getEntity(entity, true, false));
    }
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity) {
        return await this.driver.updateById(this.getStorageName(), this.getPrimaryName(), id, this.getEntity(entity, true, false));
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param filter Filter columns.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(filter) {
        return await this.driver.delete(this.getStorageName(), filter);
    }
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(id) {
        return await this.driver.deleteById(this.getStorageName(), this.getPrimaryName(), id);
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
], Mapper.prototype, "getStorageName", null);
__decorate([
    Class.Private()
], Mapper.prototype, "getEntity", null);
__decorate([
    Class.Private()
], Mapper.prototype, "getEntities", null);
__decorate([
    Class.Public()
], Mapper.prototype, "normalize", null);
__decorate([
    Class.Public()
], Mapper.prototype, "insertMany", null);
__decorate([
    Class.Public()
], Mapper.prototype, "insert", null);
__decorate([
    Class.Public()
], Mapper.prototype, "find", null);
__decorate([
    Class.Public()
], Mapper.prototype, "findById", null);
__decorate([
    Class.Public()
], Mapper.prototype, "update", null);
__decorate([
    Class.Public()
], Mapper.prototype, "updateById", null);
__decorate([
    Class.Public()
], Mapper.prototype, "delete", null);
__decorate([
    Class.Public()
], Mapper.prototype, "deleteById", null);
Mapper = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
