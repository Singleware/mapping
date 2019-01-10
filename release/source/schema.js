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
const Types = require("@singleware/types");
const format_1 = require("./format");
/**
 * Schema helper class.
 */
let Schema = class Schema extends Class.Null {
    /**
     * Sets the column format for the specified entity prototype.
     * @param column Column schema.
     * @param prototype Entity prototype.
     * @param property Entity property
     * @param descriptor Entity descriptor.
     * @returns Returns the wrapped descriptor.
     */
    static setFormat(column, scope, property, descriptor) {
        if (column.validators.length === 0) {
            const format = new Types.Common.Group(Types.Common.Group.OR, column.validators);
            const wrapped = Types.Validate(format)(scope, property, descriptor);
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
            this.storages.set(type, (storage = { virtual: {}, columns: {} }));
        }
        return storage;
    }
    /**
     * Register a virtual column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local column name.
     * @returns Returns the join schema.
     */
    static registerVirtual(type, name, foreign, model, local) {
        const storage = this.setStorage(type);
        if (name in storage.columns) {
            throw new Error(`A column with the name '${name}' already exists.`);
        }
        if (!(name in storage.virtual)) {
            storage.virtual[name] = { name: name, foreign: foreign, local: local, model: model };
        }
        return storage.virtual[name];
    }
    /**
     * Register a column schema for the specified column information.
     * @param type Column type.
     * @param name Column name.
     * @returns Returns the column schema.
     */
    static registerColumn(type, name) {
        const storage = this.setStorage(type);
        if (name in storage.virtual) {
            throw new Error(`A virtual column with the name '${name}' already exists.`);
        }
        if (!(name in storage.columns)) {
            storage.columns[name] = { name: name, types: [], validators: [] };
        }
        return storage.columns[name];
    }
    /**
     * Resolves the column schema dependencies to be used externally.
     * @param column Column schema.
     * @returns Returns the prepared column schema.
     */
    static resolveColumn(column) {
        const newer = { ...column };
        if (newer.model) {
            newer.schema = this.getRow(newer.model);
        }
        return Object.freeze(newer);
    }
    /**
     * Gets the row schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the row schema or undefined when the entity model does not exists.
     */
    static getRow(model) {
        const storage = this.setStorage(model.prototype.constructor);
        if (storage) {
            const row = { ...storage.columns };
            for (const name in row) {
                row[name] = this.resolveColumn(row[name]);
            }
            return Object.freeze(row);
        }
        return void 0;
    }
    /**
     * Gets the virtual columns schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the joined schema or undefined when the entity model does not exists.
     */
    static getVirtual(model) {
        const storage = this.setStorage(model.prototype.constructor);
        if (storage) {
            return Object.freeze({ ...storage.virtual });
        }
        return void 0;
    }
    /**
     * Gets the column schema for the specified entity model and column name.
     * @param model Entity model.
     * @param name Column name.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getColumn(model, name) {
        const storage = this.setStorage(model.prototype.constructor);
        if (storage) {
            return name in storage.columns ? this.resolveColumn(storage.columns[name]) : void 0;
        }
        return void 0;
    }
    /**
     * Gets the primary column schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getPrimary(model) {
        const storage = this.storages.get(model.prototype.constructor);
        return storage ? this.getColumn(model, storage.primary) : void 0;
    }
    /**
     * Gets the storage name for the specified entity model.
     * @param model Entity model.
     * @returns Returns the storage name or undefined when the entity does not exists.
     */
    static getStorage(model) {
        const storage = this.storages.get(model.prototype.constructor);
        return storage ? storage.name : void 0;
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
            this.registerColumn(scope.constructor, property).alias = name;
        };
    }
    /**
     * Decorates the specified property to be a required column.
     * @returns Returns the decorator method.
     */
    static Required() {
        return (scope, property) => {
            this.registerColumn(scope.constructor, property).required = true;
        };
    }
    /**
     * Decorates the specified property to be a hidden column.
     * @returns Returns the decorator method.
     */
    static Hidden() {
        return (scope, property) => {
            this.registerColumn(scope.constructor, property).hidden = true;
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
            this.registerVirtual(scope.constructor, property, foreign, model, local);
            descriptor = Types.Validate(new Types.Common.Any())(scope, property, descriptor);
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.types.push(format_1.Format.ID);
            column.validators.push(new Types.Common.Any());
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a column that accepts null values.
     * @returns Returns the decorator method.
     */
    static Null() {
        return (scope, property, descriptor) => {
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.types.push(format_1.Format.NULL);
            column.validators.push(new Types.Common.Null());
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a binary column.
     * @returns Returns the decorator method.
     */
    static Binary() {
        return (scope, property, descriptor) => {
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.types.push(format_1.Format.BINARY);
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be a boolean column.
     * @returns Returns the decorator method.
     */
    static Boolean() {
        return (scope, property, descriptor) => {
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.types.push(format_1.Format.BOOLEAN);
            column.validators.push(new Types.Common.Boolean());
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(format_1.Format.INTEGER);
            column.validators.push(new Types.Common.Integer(min, max));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(format_1.Format.DECIMAL);
            column.validators.push(new Types.Common.Decimal(min, max));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(format_1.Format.NUMBER);
            column.validators.push(new Types.Common.Number(min, max));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(format_1.Format.STRING);
            column.validators.push(new Types.Common.String(min, max));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.values = values;
            column.types.push(format_1.Format.ENUMERATION);
            column.validators.push(new Types.Common.Enumeration(...values));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.pattern = pattern;
            column.types.push(format_1.Format.PATTERN);
            column.validators.push(new Types.Common.Pattern(pattern, alias));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.types.push(format_1.Format.TIMESTAMP);
            column.validators.push(new Types.Common.Timestamp(min, max));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.types.push(format_1.Format.DATE);
            column.validators.push(new Types.Common.Timestamp(min, max));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.model = model;
            column.unique = unique;
            column.minimum = min;
            column.maximum = max;
            column.types.push(format_1.Format.ARRAY);
            column.validators.push(new Types.Common.InstanceOf(Array));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.model = model;
            column.types.push(format_1.Format.MAP);
            column.validators.push(new Types.Common.InstanceOf(Object));
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
            const column = this.registerColumn(scope.constructor, property);
            descriptor = this.setFormat(column, scope, property, descriptor);
            column.model = model;
            column.types.push(format_1.Format.OBJECT);
            column.validators.push(new Types.Common.InstanceOf(Object));
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
], Schema, "registerVirtual", null);
__decorate([
    Class.Private()
], Schema, "registerColumn", null);
__decorate([
    Class.Private()
], Schema, "resolveColumn", null);
__decorate([
    Class.Public()
], Schema, "getRow", null);
__decorate([
    Class.Public()
], Schema, "getVirtual", null);
__decorate([
    Class.Public()
], Schema, "getColumn", null);
__decorate([
    Class.Public()
], Schema, "getPrimary", null);
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
