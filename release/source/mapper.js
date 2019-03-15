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
     * Creates a new entity based on the specified model type and input data.
     * @param model Model type.
     * @param data Input data.
     * @param input Determines whether the data will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated entity based on the model type.
     * @throws Throws an error when some required column was not supplied or some read-only/write-only property was set wrongly.
     */
    static createEntity(model, data, input, fully) {
        const entity = new model();
        const storage = schema_1.Schema.getStorage(model);
        const columns = schema_1.Schema.getRealRow(model);
        for (const name in columns) {
            const column = columns[name];
            const source = input ? column.name : column.alias || column.name;
            const target = input ? column.alias || column.name : column.name;
            if (source in data && data[source] !== void 0) {
                if (input && column.readonly) {
                    throw new Error(`Column '${target}' in the entity '${storage}' is read-only.`);
                }
                else if (!input && column.writeonly) {
                    throw new Error(`Column '${target}' in the entity '${storage}' is write-only.`);
                }
                else {
                    entity[target] = this.castValue(column, data[source], input, fully);
                }
            }
            else if (fully && column.required) {
                throw new Error(`Column '${name}' in the entity '${storage}' is required.`);
            }
        }
        return entity;
    }
    /**
     * Creates a new list of entities based on the specified model type and the list of data.
     * @param model Model type.
     * @param list List of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated list of entities based on the model type.
     */
    static createEntityArray(model, list, input, fully) {
        const entities = [];
        for (const data of list) {
            entities.push(this.createEntity(model, data, input, fully));
        }
        return entities;
    }
    /**
     * Create a new map of entities based on the specified model type and map of data.
     * @param model Model type.
     * @param map Map of data.
     * @param input Determines whether the data will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated map of entities based on the model type.
     */
    static createEntityMap(model, map, input, fully) {
        const entities = {};
        for (const name in map) {
            entities[name] = this.createEntity(model, map[name], input, fully);
        }
        return entities;
    }
    /**
     * Check whether the specified value can be converted to an entity.
     * @param real Real column schema.
     * @param value Value to be converted.
     * @param input Determines whether the value will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the original or the converted value.
     */
    static castValue(real, value, input, fully) {
        if (real.model && !this.commons.includes(real.model)) {
            if (real.formats.includes(Types.Format.ARRAY)) {
                return this.createEntityArray(real.model, value, input, fully);
            }
            else if (real.formats.includes(Types.Format.MAP)) {
                return this.createEntityMap(real.model, value, input, fully);
            }
            else {
                return this.createEntity(real.model, value, input, fully);
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
        if (real.model && !this.commons.includes(real.model)) {
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
        const rColumns = schema_1.Schema.getRealRow(model);
        const vColumns = schema_1.Schema.getVirtualRow(model);
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
     * Adds the specified type as a common type to all mappers.
     * @param type Class type.
     */
    static addCommonType(type) {
        if (!this.commons.includes(type)) {
            this.commons.push(type);
        }
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
     * Creates a new entity based on the current model type and input data.
     * @param data Input data.
     * @param input Determines whether the data will be used for an input or output.
     * @param fully Determines whether all required properties must be provided.
     * @returns Returns the new generated entity.
     */
    createEntity(data, input, fully) {
        return Mapper_1.createEntity(this.model, data, input, fully);
    }
    /**
     * Assign all joined columns into the specified data the given entity.
     * @param data Target data.
     * @param entity Source entity.
     * @returns Returns the specified target data.
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
        const column = schema_1.Schema.getRealPrimaryColumn(this.model);
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
     * @returns Returns a promise to get the id list of all inserted entities.
     */
    async insertMany(entities) {
        const list = [];
        for (const entity of entities) {
            list.push(this.createEntity(entity, true, true));
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
     * @param filter Field filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(filter, sort, limit) {
        const list = await this.driver.find(this.model, this.getJoinedColumns(), filter, sort, limit);
        const results = [];
        for (const entity of list) {
            results.push(this.assignJoinedColumns(this.createEntity(entity, false, true), entity));
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
            return this.assignJoinedColumns(this.createEntity(entity, false, true), entity);
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
        return await this.driver.update(this.model, this.createEntity(entity, true, false), filter);
    }
    /**
     * Update a entity that corresponds to the specified id.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(id, entity) {
        return await this.driver.updateById(this.model, this.createEntity(entity, true, false), id);
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
], Mapper.prototype, "model", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "driver", void 0);
__decorate([
    Class.Private()
], Mapper.prototype, "getJoinedColumns", null);
__decorate([
    Class.Private()
], Mapper.prototype, "createEntity", null);
__decorate([
    Class.Private()
], Mapper.prototype, "assignJoinedColumns", null);
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
__decorate([
    Class.Public()
], Mapper, "addCommonType", null);
Mapper = Mapper_1 = __decorate([
    Class.Describe()
], Mapper);
exports.Mapper = Mapper;
