"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Schema_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Types = require("@singleware/types");
const formats_1 = require("./formats");
/**
 * Schema helper class.
 */
let Schema = Schema_1 = class Schema {
    /**
     * Sets the column format for the specified entity prototype.
     * @param column Column schema.
     * @param prototype Entity prototype.
     * @param property Entity property
     * @param descriptor Entity descriptor.
     * @returns Returns the wrapped descriptor.
     */
    static setFormat(column, prototype, property, descriptor) {
        if (column.validators.length > 0) {
            return descriptor;
        }
        return Types.Validate(column.validators)(prototype, property, descriptor);
    }
    /**
     * Sets a storage for the specified entity type.
     * @param type Entity type.
     * @returns Returns the entity type.
     */
    static setStorage(type) {
        let storage = Schema_1.storages.get(type);
        if (!storage) {
            Schema_1.storages.set(type, (storage = { row: {} }));
        }
        return storage;
    }
    /**
     * Sets a column schema for the specified column type and name.
     * @param type Column type.
     * @param name Column name.
     * @returns Returns the column schema.
     */
    static setColumn(type, name) {
        const storage = Schema_1.setStorage(type);
        if (!(name in storage.row)) {
            storage.row[name] = { name: name, types: [], validators: [] };
        }
        return storage.row[name];
    }
    /**
     * Loads the column schema dependencies to be used externally.
     * @param column Column schema.
     * @returns Returns the prepared column schema.
     */
    static loadColumn(column) {
        const newer = { ...column };
        if (newer.model) {
            newer.schema = Schema_1.getRow(newer.model);
        }
        return Object.freeze(newer);
    }
    /**
     * Gets the row schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the row schema or undefined when the row schema does not exists.
     */
    static getRow(model) {
        const storage = Schema_1.setStorage(model.prototype.constructor);
        if (storage) {
            const row = { ...storage.row };
            for (const name in row) {
                row[name] = Schema_1.loadColumn(row[name]);
            }
            return Object.freeze(row);
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
        const storage = Schema_1.setStorage(model.prototype.constructor);
        if (storage) {
            return name in storage.row ? Schema_1.loadColumn(storage.row[name]) : void 0;
        }
        return void 0;
    }
    /**
     * Gets the primary column schema for the specified entity model.
     * @param model Entity model.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static getPrimaryColumn(model) {
        const storage = Schema_1.storages.get(model.prototype.constructor);
        return storage ? Schema_1.getColumn(model, storage.primary) : void 0;
    }
    /**
     * Gets the storage name for the specified entity model.
     * @param model Entity model.
     * @returns Returns the storage name or undefined when the entity does not exists.
     */
    static getStorageName(model) {
        const storage = Schema_1.storages.get(model.prototype.constructor);
        return storage ? storage.name : void 0;
    }
    /**
     * Decorates the specified class to be an entity model.
     * @param name Storage name.
     * @returns Returns the decorator method.
     */
    static Entity(name) {
        return Class.bindCallback((model) => {
            Schema_1.setStorage(model.prototype.constructor).name = name;
        });
    }
    /**
     * Decorates the specified property to be formatted with another property name.
     * @param name Alias name.
     * @returns Returns the decorator method.
     */
    static Alias(name) {
        return Class.bindCallback((prototype, property) => {
            Schema_1.setColumn(prototype.constructor, property).alias = name;
        });
    }
    /**
     * Decorates the specified property to be a required column.
     * @returns Returns the decorator method.
     */
    static Required() {
        return Class.bindCallback((prototype, property) => {
            Schema_1.setColumn(prototype.constructor, property).required = true;
        });
    }
    /**
     * Decorates the specified property to be a hidden column.
     * @returns Returns the decorator method.
     */
    static Hidden() {
        return Class.bindCallback((prototype, property) => {
            Schema_1.setColumn(prototype.constructor, property).hidden = true;
        });
    }
    /**
     * Decorates the specified property to be a primary column.
     * @returns Returns the decorator method.
     */
    static Primary() {
        return Class.bindCallback((prototype, property) => {
            Schema_1.setStorage(prototype.constructor).primary = property;
        });
    }
    /**
     * Decorates the specified property to be an id column.
     * @returns Returns the decorator method.
     */
    static Id() {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.types.push(formats_1.Formats.ID);
            column.validators.push(new Types.Common.Any());
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a column that accepts null values.
     * @returns Returns the decorator method.
     */
    static Null() {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.types.push(formats_1.Formats.NULL);
            column.validators.push(new Types.Common.Null());
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a boolean column.
     * @returns Returns the decorator method.
     */
    static Boolean() {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.types.push(formats_1.Formats.BOOLEAN);
            column.validators.push(new Types.Common.Boolean());
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a integer column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Integer(min, max) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(formats_1.Formats.INTEGER);
            column.validators.push(new Types.Common.Integer(min, max));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a decimal column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Decimal(min, max) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(formats_1.Formats.DECIMAL);
            column.validators.push(new Types.Common.Decimal(min, max));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a number column.
     * @param min Minimum value.
     * @param max Maximum value.
     * @returns Returns the decorator method.
     */
    static Number(min, max) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(formats_1.Formats.NUMBER);
            column.validators.push(new Types.Common.Number(min, max));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a string column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static String(min, max) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.minimum = min;
            column.maximum = max;
            column.types.push(formats_1.Formats.STRING);
            column.validators.push(new Types.Common.String(min, max));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a enumeration column.
     * @param values Enumeration values.
     * @returns Returns the decorator method.
     */
    static Enumeration(...values) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.values = values;
            column.types.push(formats_1.Formats.ENUMERATION);
            column.validators.push(new Types.Common.Enumeration(...values));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a string pattern column.
     * @param pattern Pattern expression.
     * @param alias Pattern alias name.
     * @returns Returns the decorator method.
     */
    static Pattern(pattern, alias) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.pattern = pattern;
            column.types.push(formats_1.Formats.PATTERN);
            column.validators.push(new Types.Common.Pattern(pattern, alias));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a timestamp column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static Timestamp(min, max) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.types.push(formats_1.Formats.TIMESTAMP);
            column.validators.push(new Types.Common.Timestamp(min, max));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be a date column.
     * @param min Minimum date.
     * @param max Maximum date.
     * @returns Returns the decorator method.
     */
    static Date(min, max) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.types.push(formats_1.Formats.DATE);
            column.validators.push(new Types.Common.Timestamp(min, max));
            return descriptor;
        });
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
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.model = model;
            column.unique = unique;
            column.minimum = min;
            column.maximum = max;
            column.types.push(formats_1.Formats.ARRAY);
            column.validators.push(new Types.Common.InstanceOf(Array));
            return descriptor;
        });
    }
    /**
     * Decorates the specified property to be an object column.
     * @param model Entity model.
     * @returns Returns the decorator method.
     */
    static Object(model) {
        return Class.bindCallback((prototype, property, descriptor) => {
            const column = Schema_1.setColumn(prototype.constructor, property);
            descriptor = Schema_1.setFormat(column, prototype, property, descriptor);
            column.model = model;
            column.types.push(formats_1.Formats.OBJECT);
            column.validators.push(new Types.Common.InstanceOf(Object));
            return descriptor;
        });
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
], Schema, "setColumn", null);
__decorate([
    Class.Private()
], Schema, "loadColumn", null);
__decorate([
    Class.Public()
], Schema, "getRow", null);
__decorate([
    Class.Public()
], Schema, "getColumn", null);
__decorate([
    Class.Public()
], Schema, "getPrimaryColumn", null);
__decorate([
    Class.Public()
], Schema, "getStorageName", null);
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
], Schema, "Primary", null);
__decorate([
    Class.Public()
], Schema, "Id", null);
__decorate([
    Class.Public()
], Schema, "Null", null);
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
], Schema, "Object", null);
Schema = Schema_1 = __decorate([
    Class.Describe()
], Schema);
exports.Schema = Schema;
