"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
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
     * Adds the specified format validation into the provided column schema and property descriptor.
     * @param scope Entity scope.
     * @param column Column schema.
     * @param validator Data validator.
     * @param format Data format.
     * @param descriptor Property descriptor.
     * @returns Returns the wrapped property descriptor.
     */
    static addValidation(scope, column, validator, format, descriptor) {
        if (column.validations.length === 0) {
            const validation = new Validator.Common.Group(Validator.Common.Group.OR, column.validations);
            descriptor = Validator.Validate(validation)(scope, column.name, descriptor);
            descriptor.enumerable = true;
        }
        column.formats.push(format);
        column.validations.push(validator);
        return descriptor;
    }
    /**
     * Assign all properties into the storage that corresponds to the specified entity type.
     * @param type Entity type.
     * @param properties Storage properties.
     * @returns Returns the assigned storage object.
     */
    static assignStorage(type, properties) {
        let storage = this.storages.get(type);
        if (storage) {
            Object.assign(storage, properties);
        }
        else {
            storage = {
                name: type.name,
                ...properties,
                real: {},
                virtual: {}
            };
            this.storages.set(type, storage);
        }
        return storage;
    }
    /**
     * Assign all properties into the real column schema that corresponds to the specified entity type an column name.
     * @param type Entity type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     */
    static assignRealColumn(type, name, properties) {
        const storage = this.assignStorage(type);
        if (name in storage.virtual) {
            throw new Error(`A virtual column named '${name}' already exists.`);
        }
        if (name in storage.real) {
            Object.assign(storage.real[name], properties);
        }
        else {
            storage.real[name] = {
                ...properties,
                type: 'real',
                name: name,
                views: [new RegExp(`^${name}$`)],
                formats: [],
                validations: []
            };
        }
        return storage.real[name];
    }
    /**
     * Assign all properties into the virtual column schema that corresponds to the specified entity type an column name.
     * @param type Entity type.
     * @param name Column name.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local column name.
     * @param filter Column filter.
     * @returns Returns the created column schema.
     */
    static assignVirtualColumn(type, name, foreign, model, local, filter) {
        const storage = this.assignStorage(type);
        if (name in storage.real) {
            throw new Error(`A real column named '${name}' already exists.`);
        }
        if (!(name in storage.virtual)) {
            storage.virtual[name] = {
                type: 'virtual',
                name: name,
                views: [new RegExp(`^${name}$`)],
                foreign: foreign,
                local: local,
                model: model,
                filter: filter
            };
        }
        return storage.virtual[name];
    }
    /**
     * Assign all properties into a real or virtual column schema that corresponds to the specified entity type an column name.
     * @param type Entity type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     */
    static assignRealOrVirtualColumn(type, name, properties) {
        const storage = this.assignStorage(type);
        if (name in storage.virtual) {
            Object.assign(storage.virtual[name], properties);
            return storage.real[name];
        }
        else if (name in storage.real) {
            Object.assign(storage.real[name], properties);
            return storage.real[name];
        }
        else {
            throw new Error(`There's no column '${name}'.`);
        }
    }
    /**
     * Determines whether the specified model is a valid entity.
     * @param model Entity model.
     * @returns Returns true when the specified model is a valid entity, false otherwise.
     */
    static isEntity(model) {
        if (model && model.prototype) {
            return this.storages.has(model.prototype.constructor);
        }
        return false;
    }
    /**
     * Determines whether one view in the given view list exists in the specified column schema.
     * @param views List of views.
     * @param column Column base schema.
     * @returns Returns true when the view is valid or false otherwise.
     */
    static isView(column, ...views) {
        for (const view of views) {
            if (view === Types.View.ALL || column.views.some((current) => current.test(view))) {
                return true;
            }
        }
        return false;
    }
    /**
     * Gets the real row schema from the specified entity model and list of view modes.
     * @param model Entity model.
     * @param views List of view modes.
     * @returns Returns the row schema or undefined when the entity model does not exists.
     * @throws Throws an error when the entity model isn't valid.
     */
    static getRealRow(model, ...views) {
        const storage = this.storages.get(model.prototype.constructor);
        if (!storage) {
            throw new Error(`Invalid entity model '${model.prototype.constructor.name}', impossible to get real rows.`);
        }
        const row = {};
        for (const name in storage.real) {
            const column = { ...storage.real[name] };
            if (this.isView(column, ...views)) {
                row[name] = Object.freeze(column);
            }
        }
        return Object.freeze(row);
    }
    /**
     * Gets the virtual row schema from the specified entity model and list of view modes.
     * @param model Entity model.
     * @param views List of view modes.
     * @returns Returns the joined schema or undefined when the entity model does not exists.
     * @throws Throws an error when the entity model isn't valid.
     */
    static getVirtualRow(model, ...views) {
        const storage = this.storages.get(model.prototype.constructor);
        if (!storage) {
            throw new Error(`Invalid entity model '${model.prototype.constructor.name}', impossible to get virtual rows.`);
        }
        const row = {};
        for (const name in storage.virtual) {
            const column = storage.virtual[name];
            if (this.isView(column, ...views)) {
                row[name] = Object.freeze({ ...column });
            }
        }
        return Object.freeze(row);
    }
    /**
     * Gets the joint row schema from the specified entity model and list of view modes.
     * @param model Entity model.
     * @param views List of view modes.
     * @returns Returns the virtual columns list.
     */
    static getJointRow(model, ...views) {
        const columns = this.getVirtualRow(model, ...views);
        const row = {};
        for (const name in columns) {
            const schema = columns[name];
            const local = this.getRealColumn(model, schema.local);
            const foreign = this.getRealColumn(schema.model, schema.foreign);
            row[name] = Object.freeze({
                ...schema,
                type: 'joint',
                local: local.alias || local.name,
                foreign: foreign.alias || foreign.name,
                multiple: local.formats.includes(Types.Format.ARRAY)
            });
        }
        return Object.freeze(row);
    }
    /**
     * Gets the real column schema from the specified entity model and column name.
     * @param model Entity model.
     * @param name Column name.
     * @returns Returns the column schema or undefined when the column does not exists.
     * @throws Throws an error when the entity model isn't valid or the specified column was not found.
     */
    static getRealColumn(model, name) {
        const storage = this.storages.get(model.prototype.constructor);
        if (!storage) {
            throw new Error(`Invalid entity model '${model.prototype.constructor.name}', impossible to get the specified column.`);
        }
        if (!(name in storage.real)) {
            throw new Error(`Column '${name}' does not exists in the entity '${storage.name}'.`);
        }
        return Object.freeze({ ...storage.real[name] });
    }
    /**
     * Gets the primary column schema from the specified entity model.
     * @param model Entity model.
     * @returns Returns the column schema or undefined when the column does not exists.
     * @throws Throws an error when the entity model isn't valid or the primary column was not defined
     */
    static getPrimaryColumn(model) {
        const storage = this.storages.get(model.prototype.constructor);
        if (!storage) {
            throw Error(`Invalid entity model '${model.prototype.constructor}', impossible to get the primary column.`);
        }
        if (!storage.primary) {
            throw Error(`Entity '${storage.name}' without primary column.`);
        }
        return this.getRealColumn(model, storage.primary);
    }
    /**
     * Gets the storage name from the specified entity model.
     * @param model Entity model.
     * @returns Returns the storage name or undefined when the entity does not exists.
     * @throws Throws an error when the entity model isn't valid.
     */
    static getStorage(model) {
        const storage = this.storages.get(model.prototype.constructor);
        if (!storage) {
            throw Error(`Invalid entity model '${model.prototype.constructor}', impossible to get the storage name.`);
        }
        return storage.name;
    }
    /**
     * Decorates the specified class to be an entity model.
     * @param name Storage name.
     * @returns Returns the decorator method.
     */
    static Entity(name) {
        return (model) => {
            this.assignStorage(model.prototype.constructor, { name: name });
        };
    }
    /**
     * Decorates the specified property to be referenced by another property name.
     * @param name Alias name.
     * @returns Returns the decorator method.
     */
    static Alias(name) {
        return (scope, property) => {
            this.assignRealColumn(scope.constructor, property, { alias: name });
        };
    }
    /**
     * Decorates the specified property to be visible only in specific scenarios.
     * @param views List of views.
     * @returns Returns the decorator method.
     */
    static Views(...views) {
        return (scope, property) => {
            this.assignRealOrVirtualColumn(scope.constructor, property, { views: views });
        };
    }
    /**
     * Decorates the specified property to convert its input and output values.
     * @param callback Converter callback.
     * @returns Returns the decorator method.
     */
    static Convert(callback) {
        return (scope, property) => {
            this.assignRealOrVirtualColumn(scope.constructor, property, { converter: callback });
        };
    }
    /**
     * Decorates the specified property to be a required column.
     * @returns Returns the decorator method.
     */
    static Required() {
        return (scope, property) => {
            this.assignRealOrVirtualColumn(scope.constructor, property, { required: true });
        };
    }
    /**
     * Decorates the specified property to be a hidden column.
     * @returns Returns the decorator method.
     */
    static Hidden() {
        return (scope, property) => {
            this.assignRealOrVirtualColumn(scope.constructor, property, { hidden: true });
        };
    }
    /**
     * Decorates the specified property to be a read-only column.
     * @returns Returns the decorator method.
     * @throws Throws an error when the column is already write-only.
     */
    static ReadOnly() {
        return (scope, property) => {
            const column = this.assignRealColumn(scope.constructor, property, { readOnly: true });
            if (column.writeOnly) {
                throw new Error(`Column '${property}' is already write-only.`);
            }
        };
    }
    /**
     * Decorates the specified property to be a write-only column.
     * @returns Returns the decorator method.
     * @throws Throws an error when the column is already read-only.
     */
    static WriteOnly() {
        return (scope, property) => {
            const column = this.assignRealColumn(scope.constructor, property, { writeOnly: true });
            if (column.readOnly) {
                throw new Error(`Column '${property}' is already read-only.`);
            }
        };
    }
    /**
     * Decorates the specified property to be virtual column of a foreign entity.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name.
     * @returns Returns the decorator method.
     */
    static Join(foreign, model, local) {
        return (scope, property, descriptor) => {
            this.assignVirtualColumn(scope.constructor, property, foreign, model, local);
            descriptor = Validator.Validate(new Validator.Common.Any())(scope, property, descriptor);
            descriptor.enumerable = true;
            return descriptor;
        };
    }
    /**
     * Decorates the specified property to be virtual column of a foreign entity list.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name.
     * @param filter Column filter.
     * @returns Returns the decorator method.
     */
    static JoinAll(foreign, model, local, filter) {
        return (scope, property, descriptor) => {
            this.assignVirtualColumn(scope.constructor, property, foreign, model, local, filter);
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
            this.assignStorage(scope.constructor, { primary: property });
        };
    }
    /**
     * Decorates the specified property to be an id column.
     * @returns Returns the decorator method.
     */
    static Id() {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property), new Validator.Common.Any(), Types.Format.ID, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a column that accepts null values.
     * @returns Returns the decorator method.
     */
    static Null() {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property), new Validator.Common.Null(), Types.Format.NULL, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a binary column.
     * @returns Returns the decorator method.
     */
    static Binary() {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property), new Validator.Common.Any(), Types.Format.BINARY, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a boolean column.
     * @returns Returns the decorator method.
     */
    static Boolean() {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property), new Validator.Common.Boolean(), Types.Format.BOOLEAN, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a integer column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Integer(minimum, maximum) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { minimum: minimum, maximum: maximum }), new Validator.Common.Integer(minimum, maximum), Types.Format.INTEGER, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a decimal column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Decimal(minimum, maximum) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { minimum: minimum, maximum: maximum }), new Validator.Common.Decimal(minimum, maximum), Types.Format.DECIMAL, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a number column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Number(minimum, maximum) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { minimum: minimum, maximum: maximum }), new Validator.Common.Number(minimum, maximum), Types.Format.NUMBER, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a string column.
     * @param minimum Minimum length.
     * @param maximum Maximum length.
     * @returns Returns the decorator method.
     */
    static String(minimum, maximum) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { minimum: minimum, maximum: maximum }), new Validator.Common.String(minimum, maximum), Types.Format.STRING, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a enumeration column.
     * @param values Enumeration values.
     * @returns Returns the decorator method.
     */
    static Enumeration(...values) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { values: values }), new Validator.Common.Enumeration(...values), Types.Format.ENUMERATION, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a string pattern column.
     * @param pattern Pattern expression.
     * @param name Pattern name.
     * @returns Returns the decorator method.
     */
    static Pattern(pattern, name) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { pattern: pattern }), new Validator.Common.Pattern(pattern, name), Types.Format.PATTERN, descriptor);
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
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property), new Validator.Common.Timestamp(min, max), Types.Format.TIMESTAMP, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a date column.
     * @param minimum Minimum date.
     * @param maximum Maximum date.
     * @returns Returns the decorator method.
     */
    static Date(minimum, maximum) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property), new Validator.Common.Timestamp(minimum, maximum), Types.Format.DATE, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an array column.
     * @param model Model type.
     * @param unique Determines whether the items of array must be unique or not.
     * @param minimum Minimum items.
     * @param maximum Maximum items.
     * @returns Returns the decorator method.
     */
    static Array(model, unique, minimum, maximum) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, {
                model: model,
                unique: unique,
                minimum: minimum,
                maximum: maximum
            }), new Validator.Common.InstanceOf(Array), Types.Format.ARRAY, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an map column.
     * @param model Model type.
     * @returns Returns the decorator method.
     */
    static Map(model) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { model: model }), new Validator.Common.InstanceOf(Object), Types.Format.MAP, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an object column.
     * @param model Model type.
     * @returns Returns the decorator method.
     */
    static Object(model) {
        return (scope, property, descriptor) => {
            return this.addValidation(scope, this.assignRealColumn(scope.constructor, property, { model: model }), new Validator.Common.InstanceOf(Object), Types.Format.OBJECT, descriptor);
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
], Schema, "addValidation", null);
__decorate([
    Class.Private()
], Schema, "assignStorage", null);
__decorate([
    Class.Private()
], Schema, "assignRealColumn", null);
__decorate([
    Class.Private()
], Schema, "assignVirtualColumn", null);
__decorate([
    Class.Private()
], Schema, "assignRealOrVirtualColumn", null);
__decorate([
    Class.Public()
], Schema, "isEntity", null);
__decorate([
    Class.Public()
], Schema, "isView", null);
__decorate([
    Class.Public()
], Schema, "getRealRow", null);
__decorate([
    Class.Public()
], Schema, "getVirtualRow", null);
__decorate([
    Class.Public()
], Schema, "getJointRow", null);
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
], Schema, "Views", null);
__decorate([
    Class.Public()
], Schema, "Convert", null);
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
], Schema, "JoinAll", null);
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
