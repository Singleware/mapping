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
const Validator = require("@singleware/types");
const Types = require("./types");
/**
 * Schema helper class.
 */
let Schema = class Schema extends Class.Null {
    /**
     * Sets the column validation format for the specified entity prototype.
     * @param column Column schema.
     * @param prototype Entity prototype.
     * @param property Entity property.
     * @param descriptor Entity descriptor.
     * @returns Returns the wrapped descriptor.
     */
    static setFormat(column, prototype, property, descriptor) {
        if (column.validation.length === 0) {
            const grouping = new Validator.Common.Group(Validator.Common.Group.OR, column.validation);
            const wrapped = Validator.Validate(grouping)(prototype, property, descriptor);
            wrapped.enumerable = true;
            return wrapped;
        }
        return descriptor;
    }
    /**
     * Sets a storage for the specified entity type.
     * @param type Entity type.
     * @returns Returns the entity type.
     */
    static setStorage(type) {
        let storage = this.storages.get(type);
        if (!storage) {
            this.storages.set(type, (storage = { real: {}, virtual: {} }));
        }
        return storage;
    }
    /**
     * Set a real column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @param format Column data format.
     * @returns Returns the column schema.
     */
    static setReal(type, name, format) {
        const storage = this.setStorage(type);
        if (name in storage.virtual) {
            throw new Error(`A virtual column with the name '${name}' already exists.`);
        }
        if (!(name in storage.real)) {
            const column = { name: name, formats: [], validation: [] };
            storage.real[name] = column;
            if (format) {
                column.formats.push(format);
            }
        }
        return storage.real[name];
    }
    /**
     * Set a virtual column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local column name.
     * @returns Returns the join schema.
     */
    static setVirtual(type, name, foreign, model, local) {
        const storage = this.setStorage(type);
        if (name in storage.real) {
            throw new Error(`A real column with the name '${name}' already exists.`);
        }
        if (!(name in storage.virtual)) {
            const column = { name: name, foreign: foreign, local: local, model: model };
            storage.virtual[name] = column;
        }
        return storage.virtual[name];
    }
    /**
     * Resolve any dependency in the specified real column schema to be used externally.
     * @param column Column schema.
     * @returns Returns the resolved column schema.
     */
    static resolveRealColumn(column) {
        const newer = { ...column };
        if (newer.model) {
            newer.schema = this.getRealRow(newer.model);
        }
        return Object.freeze(newer);
    }
    /**
     * Gets the real row schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the row schema or undefined when the entity model does not exists.
     */
    static getRealRow(model) {
        const storage = this.setStorage(model.prototype.constructor);
        if (storage) {
            const row = { ...storage.real };
            for (const name in row) {
                row[name] = this.resolveRealColumn(row[name]);
            }
            return Object.freeze(row);
        }
        return void 0;
    }
    /**
     * Gets the virtual row schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the joined schema or undefined when the entity model does not exists.
     */
    static getVirtualRow(model) {
        const storage = this.setStorage(model.prototype.constructor);
        if (storage) {
            const row = { ...storage.virtual };
            return Object.freeze(row);
        }
        return void 0;
    }
    /**
     * Gets the real column schema from the specified entity model and column name.
     * @param model Entity model.
     * @param name Column name.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getRealColumn(model, name) {
        const storage = this.setStorage(model.prototype.constructor);
        if (storage && name in storage.real) {
            return this.resolveRealColumn(storage.real[name]);
        }
        return void 0;
    }
    /**
     * Gets the real primary column schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getPrimaryColumn(model) {
        const storage = this.storages.get(model.prototype.constructor);
        if (storage) {
            return this.getRealColumn(model, storage.primary);
        }
        return void 0;
    }
    /**
     * Gets the storage name from the specified entity model.
     * @param model Entity model.
     * @returns Returns the storage name or undefined when the entity does not exists.
     */
    static getStorage(model) {
        const storage = this.storages.get(model.prototype.constructor);
        if (storage) {
            return storage.name;
        }
        return void 0;
    }
    /**
     * Decorates the specified class to be an entity model.
     * @param name Storage name.
     * @returns Returns the decorator method.
     */
    static Entity(name) {
        return (model) => {
            this.setStorage(model.prototype.constructor).name = name;
        };
    }
    /**
     * Decorates the specified property to be referenced by another property name.
     * @param name Alias name.
     * @returns Returns the decorator method.
     */
    static Alias(name) {
        return (scope, property) => {
            this.setReal(scope.constructor, property).alias = name;
        };
    }
    /**
     * Decorates the specified property to be a required column.
     * @returns Returns the decorator method.
     */
    static Required() {
        return (scope, property) => {
            this.setReal(scope.constructor, property).required = true;
        };
    }
    /**
     * Decorates the specified property to be a hidden column.
     * @returns Returns the decorator method.
     */
    static Hidden() {
        return (scope, property) => {
            this.setReal(scope.constructor, property).hidden = true;
        };
    }
    /**
     * Decorates the specified property to be a read-only column.
     * @returns Returns the decorator method.
     */
    static ReadOnly() {
        return (scope, property) => {
            this.setReal(scope.constructor, property).readonly = true;
        };
    }
    /**
     * Decorates the specified property to be a write-only column.
     * @returns Returns the decorator method.
     */
    static WriteOnly() {
        return (scope, property) => {
            this.setReal(scope.constructor, property).writeonly = true;
        };
    }
    /**
     * Decorates the specified property to be virtual column of a foreign entity.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name. (When omitted the primary ID column will be used as default)
     * @returns Returns the decorator method.
     */
    static Join(foreign, model, local) {
        return (scope, property, descriptor) => {
            this.setVirtual(scope.constructor, property, foreign, model, local);
            descriptor = Validator.Validate(new Validator.Common.Any())(scope, property, descriptor);
            descriptor.enumerable = true;
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a primary column.
     * @returns Returns the decorator method.
     */
    static Primary() {
        return (scope, property) => {
            this.setStorage(scope.constructor).primary = property;
        };
    }
    /**
     * Decorates the specified property to be an id column.
     * @returns Returns the decorator method.
     */
    static Id() {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.ID);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.validation.push(new Validator.Common.Any());
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a column that accepts null values.
     * @returns Returns the decorator method.
     */
    static Null() {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.NULL);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.validation.push(new Validator.Common.Null());
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a binary column.
     * @returns Returns the decorator method.
     */
    static Binary() {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.BINARY);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.validation.push(new Validator.Common.Any());
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a boolean column.
     * @returns Returns the decorator method.
     */
    static Boolean() {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.BOOLEAN);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.validation.push(new Validator.Common.Boolean());
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a integer column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Integer(min, max) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.INTEGER);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.validation.push(new Validator.Common.Integer(min, max));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a decimal column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Decimal(min, max) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.DECIMAL);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.validation.push(new Validator.Common.Decimal(min, max));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a number column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Number(min, max) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.NUMBER);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.validation.push(new Validator.Common.Number(min, max));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a string column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static String(min, max) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.STRING);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.validation.push(new Validator.Common.String(min, max));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a enumeration column.
     * @param values Enumeration values.
     * @returns Returns the decorator method.
     */
    static Enumeration(...values) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.ENUMERATION);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.values = values;
            column.validation.push(new Validator.Common.Enumeration(...values));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a string pattern column.
     * @param pattern Pattern expression.
     * @param alias Pattern alias name.
     * @returns Returns the decorator method.
     */
    static Pattern(pattern, alias) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.PATTERN);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.pattern = pattern;
            column.validation.push(new Validator.Common.Pattern(pattern, alias));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a timestamp column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static Timestamp(min, max) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.TIMESTAMP);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.validation.push(new Validator.Common.Timestamp(min, max));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a date column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static Date(min, max) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.DATE);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.validation.push(new Validator.Common.Timestamp(min, max));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be an array column.
     * @param model Entity model.
     * @param unique Determines whether the array items must be unique or not.
     * @param min Minimum items.
     * @param max Maximum items.
     * @returns Returns the decorator method.
     */
    static Array(model, unique, min, max) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.ARRAY);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.model = model;
            column.unique = unique;
            column.minimum = min;
            column.maximum = max;
            column.validation.push(new Validator.Common.InstanceOf(Array));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be an map column.
     * @param model Entity model.
     * @returns Returns the decorator method.
     */
    static Map(model) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.MAP);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.model = model;
            column.validation.push(new Validator.Common.InstanceOf(Object));
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be an object column.
     * @param model Entity model.
     * @returns Returns the decorator method.
     */
    static Object(model) {
        return (scope, property, descriptor) => {
            const column = this.setReal(scope.constructor, property, Types.Format.OBJECT);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.model = model;
            column.validation.push(new Validator.Common.InstanceOf(Object));
            return descriptor;
        };
    }
};
/**
 * Map of entity storages.
 */
Schema.storages = new WeakMap();
__decorate([
    Class.Private()
], Schema, "storages", void 0);
__decorate([
    Class.Private()
], Schema, "setFormat", null);
__decorate([
    Class.Private()
], Schema, "setStorage", null);
__decorate([
    Class.Private()
], Schema, "setReal", null);
__decorate([
    Class.Private()
], Schema, "setVirtual", null);
__decorate([
    Class.Private()
], Schema, "resolveRealColumn", null);
__decorate([
    Class.Public()
], Schema, "getRealRow", null);
__decorate([
    Class.Public()
], Schema, "getVirtualRow", null);
__decorate([
    Class.Public()
], Schema, "getRealColumn", null);
__decorate([
    Class.Public()
], Schema, "getPrimaryColumn", null);
__decorate([
    Class.Public()
], Schema, "getStorage", null);
__decorate([
    Class.Public()
], Schema, "Entity", null);
__decorate([
    Class.Public()
], Schema, "Alias", null);
__decorate([
    Class.Public()
], Schema, "Required", null);
__decorate([
    Class.Public()
], Schema, "Hidden", null);
__decorate([
    Class.Public()
], Schema, "ReadOnly", null);
__decorate([
    Class.Public()
], Schema, "WriteOnly", null);
__decorate([
    Class.Public()
], Schema, "Join", null);
__decorate([
    Class.Public()
], Schema, "Primary", null);
__decorate([
    Class.Public()
], Schema, "Id", null);
__decorate([
    Class.Public()
], Schema, "Null", null);
__decorate([
    Class.Public()
], Schema, "Binary", null);
__decorate([
    Class.Public()
], Schema, "Boolean", null);
__decorate([
    Class.Public()
], Schema, "Integer", null);
__decorate([
    Class.Public()
], Schema, "Decimal", null);
__decorate([
    Class.Public()
], Schema, "Number", null);
__decorate([
    Class.Public()
], Schema, "String", null);
__decorate([
    Class.Public()
], Schema, "Enumeration", null);
__decorate([
    Class.Public()
], Schema, "Pattern", null);
__decorate([
    Class.Public()
], Schema, "Timestamp", null);
__decorate([
    Class.Public()
], Schema, "Date", null);
__decorate([
    Class.Public()
], Schema, "Array", null);
__decorate([
    Class.Public()
], Schema, "Map", null);
__decorate([
    Class.Public()
], Schema, "Object", null);
Schema = __decorate([
    Class.Describe()
], Schema);
exports.Schema = Schema;
