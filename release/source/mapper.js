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
const Entities = require("./entities");
const schema_1 = require("./schema");
/**
 * Generic data mapper class.
 */
let Mapper = class Mapper extends Class.Null {
    /**
     * Default constructor.
     * @param driver Data driver.
     * @param model Entity model.
     * @throws Throws an error when the model isn't a valid entity.
     */
    constructor(driver, model) {
        super();
        if (!schema_1.Schema.isEntity(model)) {
            throw new Error(`Invalid entity model.`);
        }
        this.driver = driver;
        this.model = model;
    }
    /**
     * Insert the specified entity list into the storage using a custom model type.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertManyEx(model, entities) {
        return await this.driver.insert(model, Entities.Inputer.createFullArray(model, entities));
    }
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertMany(entities) {
        return await this.insertManyEx(this.model, entities);
    }
    /**
     * Insert the specified entity into the storage using a custom model type.
     * @param model Model type.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of the inserted entry.
     */
    async insertEx(model, entity) {
        return (await this.insertManyEx(model, [entity]))[0];
    }
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @returns Returns a promise to get the id of the inserted entity.
     */
    async insert(entity) {
        return await this.insertEx(this.model, entity);
    }
    /**
     * Find all corresponding entity in the storage.
     * @param query Query filter
     * @param fields Viewed fields.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(query, fields = []) {
        return Entities.Outputer.createFullArray(this.model, fields, await this.driver.find(this.model, query, fields));
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(id, fields = []) {
        const data = await this.driver.findById(this.model, id, fields);
        if (data !== void 0) {
            return Entities.Outputer.createFull(this.model, fields, data);
        }
        return void 0;
    }
    /**
     * Update all entities that corresponds to the specified match using a custom model type.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    async updateEx(model, match, entity) {
        return await this.driver.update(model, match, Entities.Inputer.createFull(model, entity));
    }
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(match, entity) {
        return await this.driver.update(this.model, match, Entities.Inputer.create(this.model, entity));
    }
    /**
     * Update the entity that corresponds to the specified id using a custom model type.
     * @param model Model type.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateByIdEx(model, id, entity) {
        return await this.driver.updateById(model, id, Entities.Inputer.createFull(model, entity));
    }
    /**
     * Update the entity that corresponds to the specified id.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity) {
        return await this.driver.updateById(this.model, id, Entities.Inputer.create(this.model, entity));
    }
    /**
     * Replace the entity that corresponds to the specified id using a custom model type.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    async replaceByIdEx(model, id, entity) {
        return await this.driver.replaceById(model, id, Entities.Inputer.createFull(model, entity));
    }
    /**
     * Replace the entity that corresponds to the specified id.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    async replaceById(id, entity) {
        return await this.driver.replaceById(this.model, id, Entities.Inputer.create(this.model, entity));
    }
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching filter.
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
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    async count(query) {
        return await this.driver.count(this.model, query);
    }
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @param aliased Determines whether the entity should be aliased or not.
     * @returns Returns the normalized entity.
     */
    normalize(entity, aliased) {
        return Entities.Normalizer.create(this.model, entity, aliased || false, false);
    }
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entity list.
     * @param aliased Determines whether the entity should be aliased or not.
     * @returns Returns the list of normalized entities.
     */
    normalizeAll(entities, aliased) {
        return entities.map((entity) => this.normalize(entity, aliased));
    }
    /**
     * Normalize all entities in the specified entity list to a new map of entities.
     * @param entities Entity list.
     * @param aliased Determines whether the entity should be aliased or not.
     * @returns Returns the map of normalized entities.
     */
    normalizeAsMap(entities, aliased) {
        const column = schema_1.Schema.getPrimaryColumn(this.model);
        const primary = schema_1.Schema.getColumnName(column);
        const data = {};
        for (const input of entities) {
            const entity = this.normalize(input, aliased);
            data[entity[primary]] = entity;
        }
        return data;
    }
};
__decorate([
    Class.Private()
], Mapper.prototype, "model", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "driver", void 0);
__decorate([
    Class.Protected()
], Mapper.prototype, "insertManyEx", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "insertMany", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "insertEx", null);
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
], Mapper.prototype, "updateEx", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "update", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "updateByIdEx", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "updateById", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "replaceByIdEx", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "replaceById", null);
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
    Class.Protected()
], Mapper.prototype, "normalize", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "normalizeAll", null);
__decorate([
    Class.Protected()
], Mapper.prototype, "normalizeAsMap", null);
Mapper = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
//# sourceMappingURL=mapper.js.map