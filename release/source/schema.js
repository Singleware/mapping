"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Schema_1;
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Validator = require("@singleware/types");
const Types = require("./types");
const Castings = require("./castings");
/**
 * Schema helper class.
 */
let Schema = Schema_1 = class Schema extends Class.Null {
    /**
     * Adds the specified format validation into the provided column schema and property descriptor.
     * @param target Model target.
     * @param schema Column schema.
     * @param validator Data validator.
     * @param format Data format.
     * @param descriptor Property descriptor.
     * @returns Returns the wrapped property descriptor.
     */
    static addValidation(target, schema, validator, format, descriptor) {
        if (schema.validations.length === 0) {
            const validation = new Validator.Common.Group(Validator.Common.Group.OR, schema.validations);
            descriptor = Validator.Validate(validation)(target, schema.name, descriptor);
            descriptor.enumerable = true;
            schema.validations.push(new Validator.Common.Undefined());
        }
        schema.formats.push(format);
        schema.validations.push(validator);
        return descriptor;
    }
    /**
     * Assign all properties into the storage that corresponds to the specified model type.
     * @param model Model type.
     * @param properties Storage properties.
     * @returns Returns the assigned storage object.
     */
    static assignStorage(model, properties) {
        let storage = this.storages.get(model);
        if (storage) {
            Object.assign(storage, properties);
        }
        else {
            storage = {
                name: model.name,
                ...properties,
                real: {},
                virtual: {}
            };
            this.storages.set(model, storage);
        }
        return storage;
    }
    /**
     * Assign all properties into the column schema that corresponds to the specified model type and column name.
     * @param model Model type.
     * @param type Column type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     * @throws Throws an error when a column with the same name and another type already exists.
     */
    static assignColumn(model, type, name, properties) {
        const storage = this.assignStorage(model);
        const row = storage[type];
        if (type === "real" /* Real */ && name in storage.virtual) {
            throw new Error(`A virtual column named '${name}' already exists.`);
        }
        else if (type === "virtual" /* Virtual */ && name in storage.real) {
            throw new Error(`A real column named '${name}' already exists.`);
        }
        if (name in row) {
            Object.assign(row[name], properties);
        }
        else {
            row[name] = {
                caster: (value) => value,
                ...properties,
                type: type,
                name: name,
                formats: [],
                validations: []
            };
        }
        return row[name];
    }
    /**
     * Assign all properties into a real or virtual column schema that corresponds to the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     * @throws Throws an error when the column does not exists yet.
     */
    static assignRealOrVirtualColumn(model, name, properties) {
        const storage = this.assignStorage(model);
        if (name in storage.virtual) {
            Object.assign(storage.virtual[name], properties);
            return storage.virtual[name];
        }
        else if (name in storage.real) {
            Object.assign(storage.real[name], properties);
            return storage.real[name];
        }
        else {
            throw new Error(`There's no virtual or real '${name}' column.`);
        }
    }
    /**
     * Determines whether or not the specified model input is a valid entity model.
     * @param input Model input.
     * @returns Returns true when the specified model input is a valid entity model, false otherwise.
     */
    static isEntity(input) {
        if (input) {
            const model = this.tryEntityModel(input);
            if (model !== void 0) {
                return this.storages.has(model.prototype.constructor);
            }
        }
        return false;
    }
    /**
     * Determines whether or not the specified entity is empty.
     * @param model Entity model.
     * @param entity Entity object.
     * @param deep Determines how deep the method can go in nested entities. Default value is: 8
     * @returns Returns true when the specified entity is empty, false otherwise.
     */
    static isEmpty(model, entity, deep = 8) {
        const columns = { ...Schema_1.getRealRow(model), ...Schema_1.getVirtualRow(model) };
        for (const name in columns) {
            const value = entity[name];
            const schema = columns[name];
            if (value instanceof Array) {
                if (schema.model && Schema_1.isEntity(schema.model)) {
                    const resolved = this.getEntityModel(schema.model);
                    for (const entry of value) {
                        if (!this.isEmpty(resolved, entry, deep)) {
                            return false;
                        }
                    }
                }
                else if (value.length > 0) {
                    return false;
                }
            }
            else if (value instanceof Object) {
                if (schema.model && Schema_1.isEntity(schema.model)) {
                    if (deep < 0 || !this.isEmpty(this.getEntityModel(schema.model), value, deep - 1)) {
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
            else if (value !== void 0 && value !== null) {
                return false;
            }
        }
        return true;
    }
    /**
     * Determines whether or not the specified column schema is visible based on the given fields.
     * @param schema Column schema.
     * @param fields Visible fields.
     * @returns Returns true when the view is valid or false otherwise.
     */
    static isVisible(schema, ...fields) {
        if (fields.length > 0) {
            const column = schema.name;
            for (const field of fields) {
                if (column === field || field.startsWith(`${column}.`)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    /**
     * Try to resolve the specified model input to a model class.
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
        const model = Schema_1.tryEntityModel(input);
        if (!model) {
            throw new Error(`Unable to resolve the specified model input.`);
        }
        return model;
    }
    /**
     * Gets the real row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the real row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static getRealRow(model, ...fields) {
        const last = Reflect.getPrototypeOf(Function);
        const row = {};
        let type, storage;
        do {
            type = model.prototype.constructor;
            if (this.storages.has(type)) {
                storage = this.storages.get(type);
                for (const name in storage.real) {
                    const column = { ...storage.real[name] };
                    if (this.isVisible(column, ...fields) && !(name in row)) {
                        row[name] = Object.freeze(column);
                    }
                }
            }
        } while ((model = Reflect.getPrototypeOf(type)) !== last);
        if (!storage) {
            throw new Error(`Invalid model type '${type.name}', unable to get the real row.`);
        }
        return Object.freeze(row);
    }
    /**
     * Gets the virtual row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the virtual row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static getVirtualRow(model, ...fields) {
        const last = Reflect.getPrototypeOf(Function);
        const row = {};
        let type, storage;
        do {
            type = model.prototype.constructor;
            if (this.storages.has(type)) {
                storage = this.storages.get(type);
                for (const name in storage.virtual) {
                    const column = storage.virtual[name];
                    if (this.isVisible(column, ...fields) && !(name in row)) {
                        row[name] = Object.freeze({ ...column });
                    }
                }
            }
        } while ((model = Reflect.getPrototypeOf(type)) !== last);
        if (!storage) {
            throw new Error(`Invalid model type '${type.name}', unable to get the virtual row.`);
        }
        return Object.freeze(row);
    }
    /**
     * Gets the real column schema from the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @returns Returns the real column schema.
     * @throws Throws an error when the model type isn't valid or the specified column was not found.
     */
    static getRealColumn(model, name) {
        const last = Reflect.getPrototypeOf(Function);
        let type, storage;
        do {
            type = model.prototype.constructor;
            if (this.storages.has(type)) {
                storage = this.storages.get(type);
                if (name in storage.real) {
                    return Object.freeze({ ...storage.real[name] });
                }
            }
        } while ((model = Reflect.getPrototypeOf(type)) !== last);
        if (storage) {
            throw new Error(`Column '${name}' does not exists in the entity '${storage.name}'.`);
        }
        else {
            throw new Error(`Invalid model type '${type.name}', unable to get the column '${name}'.`);
        }
    }
    /**
     * Gets the primary column schema from the specified model type.
     * @param model Model type.
     * @returns Returns the column schema or undefined when the column does not exists.
     * @throws Throws an error when the entity model isn't valid or the primary column was not defined
     */
    static getPrimaryColumn(model) {
        const last = Reflect.getPrototypeOf(Function);
        let type, storage;
        do {
            type = model.prototype.constructor;
            if (this.storages.has(type)) {
                storage = this.storages.get(type);
                if (storage.primary) {
                    return Object.freeze({ ...storage.real[storage.primary] });
                }
            }
        } while ((model = Reflect.getPrototypeOf(type)) !== last);
        if (storage) {
            throw Error(`Entity '${storage.name}' without primary column.`);
        }
        else {
            throw Error(`Invalid model type '${type.name}', unable to get the primary column.`);
        }
    }
    /**
     * Gets the storage name from the specified model type.
     * @param model Model type.
     * @returns Returns the storage name.
     * @throws Throws an error when the model type isn't valid.
     */
    static getStorageName(model) {
        const type = model.prototype.constructor;
        const storage = this.storages.get(type);
        if (!storage) {
            throw Error(`Invalid model type '${type.name}', unable to get the storage name.`);
        }
        return storage.name;
    }
    /**
     * Gets the column name from the specified column schema.
     * @param schema Column schema.
     * @returns Returns the column name.
     */
    static getColumnName(schema) {
        return schema.alias || schema.name;
    }
    /**
     * Get all nested fields from the given column schema and field list.
     * @param schema Column schema.
     * @param fields Field list.
     * @returns Returns a new field list containing all nested fields.
     */
    static getNestedFields(schema, fields) {
        const list = [];
        const prefix = `${this.getColumnName(schema)}.`;
        for (const field of fields) {
            if (field.startsWith(prefix)) {
                const suffix = field.substr(prefix.length);
                if (suffix.length > 0 && suffix !== '*') {
                    list.push(suffix);
                }
            }
        }
        return list;
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
        return (target, property) => {
            this.assignColumn(target.constructor, "real" /* Real */, property, { alias: name });
        };
    }
    /**
     * Decorates the specified property to convert its input and output value.
     * @param callback Caster callback.
     * @returns Returns the decorator method.
     */
    static Convert(callback) {
        return (target, property) => {
            this.assignRealOrVirtualColumn(target.constructor, property, { caster: callback });
        };
    }
    /**
     * Decorates the specified property to be a required column.
     * @returns Returns the decorator method.
     */
    static Required() {
        return (target, property) => {
            const column = this.assignRealOrVirtualColumn(target.constructor, property, {
                required: true
            });
            const index = column.validations.findIndex((validator) => validator instanceof Validator.Common.Undefined);
            column.validations.splice(index, 1);
        };
    }
    /**
     * Decorates the specified property to be a hidden column.
     * @returns Returns the decorator method.
     */
    static Hidden() {
        return (target, property) => {
            this.assignRealOrVirtualColumn(target.constructor, property, { hidden: true });
        };
    }
    /**
     * Decorates the specified property to be a read-only column.
     * @returns Returns the decorator method.
     * @throws Throws an error when the column is already write-only.
     */
    static ReadOnly() {
        return (target, property) => {
            const column = this.assignColumn(target.constructor, "real" /* Real */, property, {
                readOnly: true
            });
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
        return (target, property) => {
            const column = this.assignColumn(target.constructor, "real" /* Real */, property, {
                writeOnly: true
            });
            if (column.readOnly) {
                throw new Error(`Column '${property}' is already read-only.`);
            }
        };
    }
    /**
     * Decorates the specified property to be a virtual column of a foreign entity.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name.
     * @param match Column matching filter.
     * @param fields Fields to be selected.
     * @returns Returns the decorator method.
     */
    static Join(foreign, model, local, match, fields) {
        return (target, property, descriptor) => {
            const localModel = target.constructor;
            const localSchema = this.getRealColumn(localModel, local);
            const foreignSchema = this.getRealColumn(model, foreign);
            const multiple = localSchema.formats.includes(12 /* Array */);
            return this.addValidation(target, this.assignColumn(localModel, "virtual" /* Virtual */, property, {
                local: localSchema.alias || localSchema.name,
                foreign: foreignSchema.alias || foreignSchema.name,
                multiple: multiple,
                fields: fields,
                model: model,
                query: {
                    pre: match
                }
            }), new Validator.Common.InstanceOf(multiple ? Array : model), multiple ? 12 /* Array */ : 14 /* Object */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a virtual column of a foreign entity list.
     * @param foreign Foreign column name.
     * @param model Foreign entity model.
     * @param local Local id column name.
     * @param query Column query filter.
     * @param fields Fields to be selected.
     * @returns Returns the decorator method.
     */
    static JoinAll(foreign, model, local, query, fields) {
        return (target, property, descriptor) => {
            const localModel = target.constructor;
            const localSchema = this.getRealColumn(localModel, local);
            const foreignSchema = this.getRealColumn(model, foreign);
            return this.addValidation(target, this.assignColumn(localModel, "virtual" /* Virtual */, property, {
                local: localSchema.alias || localSchema.name,
                foreign: foreignSchema.alias || foreignSchema.name,
                multiple: localSchema.formats.includes(12 /* Array */),
                fields: fields,
                model: model,
                query: query,
                all: true
            }), new Validator.Common.InstanceOf(Array), 12 /* Array */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a primary column.
     * @returns Returns the decorator method.
     */
    static Primary() {
        return (target, property) => {
            this.assignStorage(target.constructor, { primary: property });
        };
    }
    /**
     * Decorates the specified property to be an Id column.
     * @returns Returns the decorator method.
     */
    static Id() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property), new Validator.Common.Any(), 0 /* Id */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a column that accepts null values.
     * @returns Returns the decorator method.
     */
    static Null() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property), new Validator.Common.Null(), 1 /* Null */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a binary column.
     * @returns Returns the decorator method.
     */
    static Binary() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property), new Validator.Common.Any(), 2 /* Binary */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a boolean column.
     * @returns Returns the decorator method.
     */
    static Boolean() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property), new Validator.Common.Boolean(), 3 /* Boolean */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an integer column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Integer(minimum, maximum) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, {
                minimum: minimum,
                maximum: maximum
            }), new Validator.Common.Integer(minimum, maximum), 4 /* Integer */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a decimal column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Decimal(minimum, maximum) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, {
                minimum: minimum,
                maximum: maximum
            }), new Validator.Common.Decimal(minimum, maximum), 5 /* Decimal */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a number column.
     * @param minimum Minimum value.
     * @param maximum Maximum value.
     * @returns Returns the decorator method.
     */
    static Number(minimum, maximum) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, {
                minimum: minimum,
                maximum: maximum
            }), new Validator.Common.Number(minimum, maximum), 6 /* Number */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a string column.
     * @param minimum Minimum length.
     * @param maximum Maximum length.
     * @returns Returns the decorator method.
     */
    static String(minimum, maximum) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, {
                minimum: minimum,
                maximum: maximum
            }), new Validator.Common.String(minimum, maximum), 7 /* String */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an enumeration column.
     * @param values Enumeration values.
     * @returns Returns the decorator method.
     */
    static Enumeration(...values) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, { values: values }), new Validator.Common.Enumeration(...values), 8 /* Enumeration */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a string pattern column.
     * @param pattern Pattern expression.
     * @param name Pattern name.
     * @returns Returns the decorator method.
     */
    static Pattern(pattern, name) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, { pattern: pattern }), new Validator.Common.Pattern(pattern, name), 9 /* Pattern */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a timestamp column.
     * @param minimum Minimum date.
     * @param maximum Maximum date.
     * @returns Returns the decorator method.
     */
    static Timestamp(minimum, maximum) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, {
                caster: Castings.ISODate.Integer.bind(Castings.ISODate)
            }), new Validator.Common.Integer(minimum ? minimum.getTime() : 0, maximum ? maximum.getTime() : Infinity), 10 /* Timestamp */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a date column.
     * @param minimum Minimum date.
     * @param maximum Maximum date.
     * @returns Returns the decorator method.
     */
    static Date(minimum, maximum) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, {
                caster: Castings.ISODate.Object.bind(Castings.ISODate)
            }), new Validator.Common.Timestamp(minimum, maximum), 11 /* Date */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an array column.
     * @param model Model type.
     * @param unique Determines whether the array items must be unique or not.
     * @param minimum Minimum items.
     * @param maximum Maximum items.
     * @returns Returns the decorator method.
     */
    static Array(model, unique, minimum, maximum) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, {
                model: model,
                unique: unique,
                minimum: minimum,
                maximum: maximum
            }), new Validator.Common.InstanceOf(Array), 12 /* Array */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a map column.
     * @param model Model type.
     * @returns Returns the decorator method.
     */
    static Map(model) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, { model: model }), new Validator.Common.InstanceOf(Object), 13 /* Map */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an object column.
     * @param model Model type.
     * @returns Returns the decorator method.
     */
    static Object(model) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignColumn(target.constructor, "real" /* Real */, property, { model: model }), new Validator.Common.InstanceOf(Object), 14 /* Object */, descriptor);
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
], Schema, "assignColumn", null);
__decorate([
    Class.Private()
], Schema, "assignRealOrVirtualColumn", null);
__decorate([
    Class.Public()
], Schema, "isEntity", null);
__decorate([
    Class.Public()
], Schema, "isEmpty", null);
__decorate([
    Class.Public()
], Schema, "isVisible", null);
__decorate([
    Class.Public()
], Schema, "tryEntityModel", null);
__decorate([
    Class.Public()
], Schema, "getEntityModel", null);
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
], Schema, "getStorageName", null);
__decorate([
    Class.Public()
], Schema, "getColumnName", null);
__decorate([
    Class.Public()
], Schema, "getNestedFields", null);
__decorate([
    Class.Public()
], Schema, "Entity", null);
__decorate([
    Class.Public()
], Schema, "Alias", null);
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
Schema = Schema_1 = __decorate([
    Class.Describe()
], Schema);
exports.Schema = Schema;
//# sourceMappingURL=schema.js.map