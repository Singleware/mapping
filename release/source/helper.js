"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Helper_1;
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const schema_1 = require("./schema");
/**
 * Helper class.
 */
let Helper = Helper_1 = class Helper extends Class.Null {
    /**
     * Try to get the resolved model class from the specified model input.
     * @param input Model input.
     * @returns Returns the resolved model class or undefined.
     */
    static tryEntityModel(input) {
        if (input instanceof Function) {
            if (`${input.prototype ? input.prototype.constructor : input}`.startsWith('class')) {
                return input;
            }
            return this.tryEntityModel(input());
        }
        return void 0;
    }
    /**
     * Get the model class based on the specified model input.
     * @param input Model input.
     * @returns Returns the model class.
     * @throws Throws an error when the specified model input doesn't resolve to a model class.
     */
    static getEntityModel(input) {
        const model = this.tryEntityModel(input);
        if (!model) {
            throw new Error(`Unable to resolve the specified model input.`);
        }
        return model;
    }
    /**
     * Try to get a list column schemas based on the specified path.
     * @param model Entity model.
     * @param path Entity path.
     * @returns Returns the list of column schemas or undefined when the path isn't valid.
     */
    static tryPathColumns(model, path) {
        let current = model;
        const models = [];
        for (const field of path.split('.')) {
            if (current === void 0) {
                return void 0;
            }
            else {
                const schema = schema_1.Schema.tryColumn(current, field);
                if (schema === void 0) {
                    return void 0;
                }
                models.push(schema);
                if (schema.model !== void 0) {
                    current = this.tryEntityModel(schema.model);
                }
            }
        }
        return models;
    }
    /**
     * Get a list column schemas based on the specified path.
     * @param model Entity model.
     * @param path Entity path.
     * @returns Returns the list of column schemas.
     * @throws Throws an error when the specified model input doesn't resolve to a model class.
     */
    static getPathColumns(model, path) {
        const schemas = this.tryPathColumns(model, path);
        if (!schemas) {
            throw new Error(`Unable to get all column schemas for the given path '${path}'.`);
        }
        return schemas;
    }
    /**
     * Determines whether or not the specified entity is empty.
     * @param model Entity model.
     * @param entity Entity object.
     * @param deep Determines how deep for nested entities. Default value is: 8
     * @returns Returns true when the specified entity is empty, false otherwise.
     */
    static isEmptyModel(model, entity, deep = 8) {
        const columns = schema_1.Schema.getRows(model);
        for (const name in columns) {
            const value = entity[name];
            const schema = columns[name];
            if (value instanceof Array) {
                if (schema.model && schema_1.Schema.isEntity(schema.model)) {
                    const resolved = Helper_1.getEntityModel(schema.model);
                    for (const entry of value) {
                        if (!this.isEmptyModel(resolved, entry, deep - 1)) {
                            return false;
                        }
                    }
                }
                else if (value.length > 0) {
                    return false;
                }
            }
            else if (value instanceof Object) {
                if (schema.model && schema_1.Schema.isEntity(schema.model)) {
                    if (deep < 0 || !this.isEmptyModel(this.getEntityModel(schema.model), value, deep - 1)) {
                        return false;
                    }
                }
                else if (Object.getPrototypeOf(value) === Object.getPrototypeOf({})) {
                    if (Object.keys(value).length > 0) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            else {
                if (value !== void 0 && value !== null) {
                    return false;
                }
            }
        }
        return true;
    }
};
__decorate([
    Class.Public()
], Helper, "tryEntityModel", null);
__decorate([
    Class.Public()
], Helper, "getEntityModel", null);
__decorate([
    Class.Public()
], Helper, "tryPathColumns", null);
__decorate([
    Class.Public()
], Helper, "getPathColumns", null);
__decorate([
    Class.Public()
], Helper, "isEmptyModel", null);
Helper = Helper_1 = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
//# sourceMappingURL=helper.js.map