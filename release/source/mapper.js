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
     * @param output Output entity model.
     * @param input Input entity model.
     * @throws Throws an error when the model isn't a valid entity.
     */
    constructor(driver, output, input = output) {
        super();
        if (!schema_1.Schema.isEntity(output) || !schema_1.Schema.isEntity(input)) {
            throw new Error(`Invalid input and/or output entity model.`);
        }
        this.driver = driver;
        this.output = output;
        this.input = input;
    }
    /**
     * Insert the specified entity list into the storage using a custom model type.
     * @param model Model type.
     * @param entities Entity list.
     * @param options Insert options.
     * @returns Returns a promise to get the Id list of all inserted entities or undefined when an error occurs.
     */
    async insertManyEx(model, entities, options) {
        const input = Entities.Inputer.createFullArray(model, entities);
        return await this.driver.insert(model, input, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Insert the specified entity list into the storage.
     * @param entities Entity list.
     * @param options Insert options.
     * @returns Returns a promise to get the Id list of all inserted entities or undefined when an error occurs.
     */
    async insertMany(entities, options) {
        return await this.insertManyEx(this.input, entities, options);
    }
    /**
     * Insert the specified entity into the storage using a custom model type.
     * @param model Model type.
     * @param entity Entity data.
     * @param options Insert options.
     * @returns Returns a promise to get the Id of the inserted entry or undefined when an error occurs.
     */
    async insertEx(model, entity, options) {
        const output = await this.insertManyEx(model, [entity], options);
        if (output !== void 0) {
            return output[0];
        }
        return void 0;
    }
    /**
     * Insert the specified entity into the storage.
     * @param entity Entity data.
     * @param options Insert options.
     * @returns Returns a promise to get the Id of the inserted entity or undefined when an error occurs.
     */
    async insert(entity, options) {
        return await this.insertEx(this.input, entity, options);
    }
    /**
     * Find all corresponding entity in the storage.
     * @param query Query filter
     * @param select Fields to select.
     * @param options Find options.
     * @returns Returns a promise to get the list of entities found or undefined when an error occurs.
     */
    async find(query, select, options) {
        const fields = select !== null && select !== void 0 ? select : [];
        const output = await this.driver.find(this.output, query, fields, options !== null && options !== void 0 ? options : {});
        if (output !== void 0) {
            return Entities.Outputer.createFullArray(this.output, output, fields);
        }
        return void 0;
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
        const output = await this.driver.findById(this.output, id, fields, options !== null && options !== void 0 ? options : {});
        if (output !== void 0) {
            return Entities.Outputer.createFull(this.output, output, fields);
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
        const output = await this.findById(id, select, options);
        if (output === void 0) {
            throw new Error(`Failed to get the entity in '${schema_1.Schema.getStorageName(this.output)}' with '${id}' as Id.`);
        }
        return output;
    }
    /**
     * Update all entities that corresponds to the specified match using a custom model type.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the number of updated entities or undefined when an error occurs.
     */
    async updateEx(model, match, entity, options) {
        const input = Entities.Inputer.createFull(model, entity);
        return this.driver.update(model, match, input, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Update all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(match, entity, options) {
        const input = Entities.Inputer.create(this.input, entity);
        return this.driver.update(this.input, match, input, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Update the entity that corresponds to the specified id using a custom model type.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the true when the entity was updated either undefined when an error occurs or false otherwise.
     */
    async updateByIdEx(model, id, entity, options) {
        const input = Entities.Inputer.createFull(model, entity);
        return this.driver.updateById(model, id, input, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Update the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Update options.
     * @returns Returns a promise to get the true when the entity was updated either undefined when an error occurs or false otherwise.
     */
    async updateById(id, entity, options) {
        const input = Entities.Inputer.create(this.input, entity);
        return this.driver.updateById(this.input, id, input, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Replace the entity that corresponds to the specified entity Id using a custom model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Replace options.
     * @returns Returns a promise to get the true when the entity was replaced either undefined when an error occurs or false otherwise.
     */
    async replaceByIdEx(model, id, entity, options) {
        const input = Entities.Inputer.createFull(model, entity);
        return this.driver.replaceById(model, id, input, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param entity Entity data.
     * @param options Replace options.
     * @returns Returns a promise to get the true when the entity was replaced either undefined when an error occurs or false otherwise.
     */
    async replaceById(id, entity, options) {
        const input = Entities.Inputer.create(this.input, entity);
        return this.driver.replaceById(this.input, id, input, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Delete all entities that corresponds to the specified match.
     * @param match Matching filter.
     * @param options Delete options.
     * @return Returns a promise to get the number of deleted entities or undefined when an error occurs.
     */
    async delete(match, options) {
        return this.driver.delete(this.output, match, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Delete the entity that corresponds to the specified entity Id.
     * @param id Entity Id.
     * @param options Delete options.
     * @return Returns a promise to get the true when the entity was deleted either undefined when an error occurs or false otherwise.
     */
    async deleteById(id, options) {
        return this.driver.deleteById(this.output, id, options !== null && options !== void 0 ? options : {});
    }
    /**
     * Count all corresponding entities from the storage.
     * @param query Query filter.
     * @param options Count options.
     * @returns Returns a promise to get the total amount of found entities or undefined when an error occurs.
     */
    async count(query, options) {
        return this.driver.count(this.output, query, options !== null && options !== void 0 ? options : {});
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
        return Entities.Normalizer.create(this.output, entity, alias, unsafe, unroll);
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
        const primary = Columns.Helper.getName(schema_1.Schema.getPrimaryColumn(this.output));
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
], Mapper.prototype, "driver", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "output", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "input", void 0);
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