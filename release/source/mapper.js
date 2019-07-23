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
const entity_1 = require("./entity");
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
            throw new Error(`The specified model isn't a valid entity model.`);
        }
        this.driver = driver;
        this.model = model;
    }
    /**
     * Insert the specified entity list into the storage using a custom model type.
     * @param model Model type.
     * @param entities Entity list.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertManyEx(model, entities, views = [Types.View.ALL]) {
        return await this.driver.insert(model, views, entity_1.Entity.createFullInputArray(model, views, entities));
    }
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertMany(entities, views = [Types.View.ALL]) {
        return await this.insertManyEx(this.model, entities, views);
    }
    /**
     * Insert the specified entity into the storage using a custom model type.
     * @param model Model type.
     * @param entity Entity data.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id of the inserted entry.
     */
    async insertEx(model, entity, views = [Types.View.ALL]) {
        return (await this.insertManyEx(model, [entity], views))[0];
    }
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the id of the inserted entity.
     */
    async insert(entity, views = [Types.View.ALL]) {
        return await this.insertEx(this.model, entity, views);
    }
    /**
     * Find all corresponding entity in the storage.
     * @param filter Field filter.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(filter, views = [Types.View.ALL]) {
        return entity_1.Entity.createFullOutputArray(this.model, views, await this.driver.find(this.model, views, filter));
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param id Entity id.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(id, views = [Types.View.ALL]) {
        const data = await this.driver.findById(this.model, views, id);
        if (data !== void 0) {
            return entity_1.Entity.createFullOutput(this.model, views, data);
        }
        return void 0;
    }
    /**
     * Update all entities that corresponds to the specified match using a custom model type.
     * @param model Model type.
     * @param match Matching fields.
     * @param entity Entity data to be updated.
     * @param views View modes.
     * @returns Returns a promise to get the number of updated entities.
     */
    async updateEx(model, match, entity, views = [Types.View.ALL]) {
        return await this.driver.update(model, views, match, entity_1.Entity.createFullInput(model, views, entity));
    }
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching fields.
     * @param entity Entity data to be updated.
     * @param views View modes, use Types.View.ALL to see all fields.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(match, entity, views = [Types.View.ALL]) {
        return await this.driver.update(this.model, views, match, entity_1.Entity.createInput(this.model, views, entity));
    }
    /**
     * Update the entity that corresponds to the specified id using a custom model type.
     * @param model Model type.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @param views View modes.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateByIdEx(model, id, entity, views = [Types.View.ALL]) {
        return await this.driver.updateById(model, views, id, entity_1.Entity.createFullInput(model, views, entity));
    }
    /**
     * Update the entity that corresponds to the specified id.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @param views View modes.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity, views = [Types.View.ALL]) {
        return await this.driver.updateById(this.model, views, id, entity_1.Entity.createInput(this.model, views, entity));
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
     * @returns Returns a promise to get the total amount of found entities.
     */
    async count(filter, views = [Types.View.ALL]) {
        return await this.driver.count(this.model, views, filter);
    }
    /**
     * Generate a new normalized entity based on the specified input data.
     * @param input Input data.
     * @returns Returns the new normalized entity data.
     */
    normalize(input) {
        return entity_1.Entity.normalize(this.model, input);
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
     * Normalize all entities in the specified input list to a new map of entities.
     * @param list Input list.
     * @returns Returns the map of normalized entities.
     */
    normalizeAsMap(...list) {
        const column = schema_1.Schema.getPrimaryColumn(this.model);
        const map = {};
        for (const input of list) {
            const normalized = this.normalize(input);
            map[normalized[column.alias || column.name]] = normalized;
        }
        return map;
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
