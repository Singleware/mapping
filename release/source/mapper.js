"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mapper = void 0;
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Entities = require("./entities");
const Columns = require("./columns");
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
     * @param options Insert options.
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertManyEx(model, entities, options) {
        return await this.driver.insert(model, Entities.Inputer.createFullArray(model, entities), options !== null && options !== void 0 ? options : {});
    }
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @param options Insert options.
     * @returns Returns a promise to get the Id list of all inserted entities.
     */
    async insertMany(entities, options) {
        return await this.insertManyEx(this.model, entities, options);
    }
    /**
     * Insert the specified entity into the storage using a custom model type.
     * @param model Model type.
     * @param entity Entity data.
     * @param options Insert options.
     * @returns Returns a promise to get the id of the inserted entry.
     */
    async insertEx(model, entity, options) {
        return (await this.insertManyEx(model, [entity], options))[0];
    }
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @param options Insert options.
     * @returns Returns a promise to get the id of the inserted entity.
     */
    async insert(entity, options) {
        return await this.insertEx(this.model, entity, options);
    }
    /**
     * Find all corresponding entity in the storage.
     * @param query Query filter
     * @param select Fields to select.
     * @param options Find options.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(query, select, options) {
        const fields = select !== null && select !== void 0 ? select : [];
        const entities = await this.driver.find(this.model, query, fields, options !== null && options !== void 0 ? options : {});
        return Entities.Outputer.createFullArray(this.model, entities, fields);
    }
    /**
     * Find the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param select Fields to select.
     * @param options Find options.
     * @returns Returns a promise to get the entity found or undefined when the entity was not found.
     */
    async findById(id, select, options) {
        const fields = select !== null && select !== void 0 ? select : [];
        const entity = await this.driver.findById(this.model, id, fields, options !== null && options !== void 0 ? options : {});
        if (entity !== void 0) {
            return Entities.Outputer.createFull(this.model, entity, fields);
        }
        return void 0;
    }
    /**
     * Gets the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param select Fields to select.
     * @param options Find options.
     * @returns Returns a promise to get the entity.
     * @throws Throws an error when the entity wasn't found.
     */
    async getById(id, select, options) {
        const entity = await this.findById(id, select, options);
        if (!entity) {
            throw new Error(`Failed to find entity by Id '${id}'.`);
        }
        return entity;
    }
    /**
     * Update all entities that corresponds to the specified match using a custom model type.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the number of updated entities.
     */
    async updateEx(model, match, entity, options) {
        return this.driver.update(model, match, Entities.Inputer.createFull(model, entity), options !== null && options !== void 0 ? options : {});
    }
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(match, entity, options) {
        return this.driver.update(this.model, match, Entities.Inputer.create(this.model, entity), options !== null && options !== void 0 ? options : {});
    }
    /**
     * Update the entity that corresponds to the specified id using a custom model type.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateByIdEx(model, id, entity, options) {
        return this.driver.updateById(model, id, Entities.Inputer.createFull(model, entity), options !== null && options !== void 0 ? options : {});
    }
    /**
     * Update the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity, options) {
        return this.driver.updateById(this.model, id, Entities.Inputer.create(this.model, entity), options !== null && options !== void 0 ? options : {});
    }
    /**
     * Replace the entity that corresponds to the specified entity Id using a custom model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Replace options.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    async replaceByIdEx(model, id, entity, options) {
        return this.driver.replaceById(model, id, Entities.Inputer.createFull(model, entity), options !== null && options !== void 0 ? options : {});
    }
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Replace options.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    async replaceById(id, entity, options) {
        return this.driver.replaceById(this.model, id, Entities.Inputer.create(this.model, entity), options !== null && options !== void 0 ? options : {});
    }
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param options Delete options.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(match, options) {
        return this.driver.delete(this.model, match, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Delete the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param options Delete options.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(id, options) {
        return this.driver.deleteById(this.model, id, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Count all corresponding entities from the storage.
     * @param query Query filter.
     * @param options Count options.
     * @returns Returns a promise to get the total amount of found entities.
     */
    async count(query, options) {
        return this.driver.count(this.model, query, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Generate a new normalized entity based on the specified entity data.
     * @param entity Entity data.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the normalized entity.
     */
    normalize(entity, alias, unsafe, unroll) {
        return Entities.Normalizer.create(this.model, entity, alias, unsafe, unroll);
    }
    /**
     * Normalize all entities in the specified entity list.
     * @param entities Entity list.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the list of normalized entities.
     */
    normalizeAll(entities, alias, unsafe, unroll) {
        return entities.map(entity => this.normalize(entity, alias, unsafe, unroll));
    }
    /**
     * Normalize all entities in the specified entity list to a new map of entities.
     * @param entities Entity list.
     * @param alias Determines whether or not all column names should be aliased.
     * @param unsafe Determines whether or not all hidden columns should be visible.
     * @param unroll Determines whether or not all columns should be unrolled.
     * @returns Returns the map of normalized entities.
     */
    normalizeAsMap(entities, alias, unsafe, unroll) {
        const primary = Columns.Helper.getName(schema_1.Schema.getPrimaryColumn(this.model));
        const data = {};
        for (const input of entities) {
            const entity = this.normalize(input, alias, unsafe, unroll);
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
    Class.Public()
], Mapper.prototype, "insertManyEx", null);
__decorate([
    Class.Public()
], Mapper.prototype, "insertMany", null);
__decorate([
    Class.Public()
], Mapper.prototype, "insertEx", null);
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
], Mapper.prototype, "getById", null);
__decorate([
    Class.Public()
], Mapper.prototype, "updateEx", null);
__decorate([
    Class.Public()
], Mapper.prototype, "update", null);
__decorate([
    Class.Public()
], Mapper.prototype, "updateByIdEx", null);
__decorate([
    Class.Public()
], Mapper.prototype, "updateById", null);
__decorate([
    Class.Public()
], Mapper.prototype, "replaceByIdEx", null);
__decorate([
    Class.Public()
], Mapper.prototype, "replaceById", null);
__decorate([
    Class.Public()
], Mapper.prototype, "delete", null);
__decorate([
    Class.Public()
], Mapper.prototype, "deleteById", null);
__decorate([
    Class.Public()
], Mapper.prototype, "count", null);
__decorate([
    Class.Public()
], Mapper.prototype, "normalize", null);
__decorate([
    Class.Public()
], Mapper.prototype, "normalizeAll", null);
__decorate([
    Class.Public()
], Mapper.prototype, "normalizeAsMap", null);
Mapper = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
//# sourceMappingURL=mapper.js.map