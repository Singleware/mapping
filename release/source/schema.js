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
 * Copyright (C) 2018-2020 Silas B. Domingos
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
     * Freeze any column in the specified row schema.
     * @param row Row schema.
     * @returns Returns a new row schema.
     */
    static freezeRowColumns(row) {
        const newer = {};
        for (const name in row) {
            const column = row[name];
            const extra = {
                formats: Object.freeze(column.formats),
                validations: Object.freeze(column.validations)
            };
            if (column.type === "real" /* Real */) {
                newer[name] = Object.freeze({
                    ...column,
                    ...extra,
                    values: Object.freeze(column.values)
                });
            }
            else {
                newer[name] = Object.freeze({
                    ...column,
                    ...extra,
                    fields: Object.freeze(column.fields)
                });
            }
        }
        return newer;
    }
    /**
     * Assign all properties to the storage that corresponds to the specified model type.
     * @param model Model type.
     * @param properties Storage properties.
     * @returns Returns the assigned storage object.
     */
    static assignToStorage(model, properties) {
        let storage = this.storages.get(model);
        if (storage !== void 0) {
            Object.assign(storage, properties);
        }
        else {
            this.storages.set(model, (storage = {
                name: model.name,
                ...properties,
                real: {},
                virtual: {}
            }));
        }
        return storage;
    }
    /**
     * Find in all storages that corresponds to the specified model type using the given callback.
     * @param model Model type.
     * @param callback Callback filter.
     * @returns Returns the found value or undefined when no value was found.
     */
    static findInStorages(model, callback) {
        const last = Reflect.getPrototypeOf(Function);
        let type = model.prototype.constructor;
        while ((model = Reflect.getPrototypeOf(type)) !== last) {
            if (this.storages.has(type)) {
                const result = callback(this.storages.get(type));
                if (result !== void 0) {
                    return result;
                }
            }
            type = model.prototype.constructor;
        }
        return void 0;
    }
    /**
     * Assign all properties to the column that corresponds to the specified model type and column name.
     * @param model Model type.
     * @param type Column type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     * @throws Throws an error when a column with the same name and another type already exists.
     */
    static assignToColumn(model, type, name, properties) {
        const storage = this.assignToStorage(model);
        const row = storage[type];
        if (type === "real" /* Real */ && name in storage.virtual) {
            throw new Error(`A virtual column named '${name}' already exists.`);
        }
        else if (type === "virtual" /* Virtual */ && name in storage.real) {
            throw new Error(`A real column named '${name}' already exists.`);
        }
        else if (name in row) {
            Object.assign(row[name], properties);
        }
        else {
            row[name] = {
                caster: value => value,
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
     * Assign all properties to a real or virtual column that corresponds to the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @param properties Column properties.
     * @returns Returns the assigned column schema.
     * @throws Throws an error when the column does not exists yet.
     */
    static assignToRVColumn(model, name, properties) {
        const storage = this.assignToStorage(model);
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
     * @returns Returns true when it's valid, false otherwise.
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
     * @param deep Determines how deep for nested entities. Default value is: 8
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
     * Determines whether or not the specified column is visible based on the given fields.
     * @param schema Column schema.
     * @param fields Visible fields.
     * @returns Returns true when the column is visible, false otherwise.
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
     * Try to get the merged real and virtual row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the real and virtual row schema or undefined when the model is invalid.
     */
    static tryRows(model, ...fields) {
        const row = {};
        let last;
        this.findInStorages(model, storage => {
            last = storage;
            for (const name in { ...storage.real, ...storage.virtual }) {
                const column = storage.real[name];
                if (this.isVisible(column, ...fields) && !(name in row)) {
                    row[name] = column;
                }
            }
        });
        if (last !== void 0) {
            return row;
        }
        return last;
    }
    /**
     * Get the merged real and virtual row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the real and virtual row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static getRows(model, ...fields) {
        const row = this.tryRows(model, ...fields);
        if (!row) {
            throw new Error(`Invalid model type, unable to get rows.`);
        }
        return row;
    }
    /**
     * Try to get the real row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the real row schema or undefined when the model is invalid.
     */
    static tryRealRow(model, ...fields) {
        const row = {};
        let last;
        this.findInStorages(model, storage => {
            last = storage;
            for (const name in storage.real) {
                const column = storage.real[name];
                if (this.isVisible(column, ...fields) && !(name in row)) {
                    row[name] = column;
                }
            }
        });
        if (last !== void 0) {
            return row;
        }
        return last;
    }
    /**
     * Gets the real row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the real row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static getRealRow(model, ...fields) {
        const row = this.tryRealRow(model, ...fields);
        if (!row) {
            throw new Error(`Invalid model type, unable to get the real row.`);
        }
        return row;
    }
    /**
     * Try to get the virtual row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the virtual row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static tryVirtualRow(model, ...fields) {
        const row = {};
        let last;
        this.findInStorages(model, storage => {
            last = storage;
            for (const name in storage.virtual) {
                const column = storage.virtual[name];
                if (!(name in row) && this.isVisible(column, ...fields)) {
                    row[name] = column;
                }
            }
        });
        if (last !== void 0) {
            return row;
        }
        return last;
    }
    /**
     * Gets the virtual row schema from the specified model type and fields.
     * @param model Model type.
     * @param fields Fields to be selected.
     * @returns Returns the virtual row schema.
     * @throws Throws an error when the model type isn't valid.
     */
    static getVirtualRow(model, ...fields) {
        const row = this.tryVirtualRow(model, ...fields);
        if (!row) {
            throw new Error(`Invalid model type, unable to get the virtual row.`);
        }
        return row;
    }
    /**
     * Try to get the real column schema from the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @returns Returns the real column schema or undefined when the column doesn't found.
     */
    static tryRealColumn(model, name) {
        return this.findInStorages(model, storage => {
            if (name in storage.real) {
                return storage.real[name];
            }
        });
    }
    /**
     * Gets the real column schema from the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @returns Returns the real column schema.
     * @throws Throws an error when the model type isn't valid or the specified column was not found.
     */
    static getRealColumn(model, name) {
        const column = this.tryRealColumn(model, name);
        if (!column) {
            throw new Error(`Column '${name}' does not exists in the entity '${this.getStorageName(model)}'.`);
        }
        return column;
    }
    /**
     * Try to get the primary column schema from the specified model type.
     * @param model Model type.
     * @returns Returns the column schema or undefined when the column does not exists.
     */
    static tryPrimaryColumn(model) {
        return this.findInStorages(model, storage => {
            if (storage.primary) {
                return storage.real[storage.primary];
            }
        });
    }
    /**
     * Gets the primary column schema from the specified model type.
     * @param model Model type.
     * @returns Returns the column schema.
     * @throws Throws an error when the entity model isn't valid or the primary column was not defined
     */
    static getPrimaryColumn(model) {
        const column = this.tryPrimaryColumn(model);
        if (!column) {
            throw Error(`Entity without primary column.`);
        }
        return column;
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
        return model => {
            const storage = this.assignToStorage(model.prototype.constructor, { name: name });
            storage.real = this.freezeRowColumns(storage.real);
            storage.virtual = this.freezeRowColumns(storage.virtual);
        };
    }
    /**
     * Decorates the specified property to be referenced by another property name.
     * @param name Alias name.
     * @returns Returns the decorator method.
     */
    static Alias(name) {
        return (target, property) => {
            this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
                alias: name
            });
        };
    }
    /**
     * Decorates the specified property to convert its input and output value.
     * @param callback Caster callback.
     * @returns Returns the decorator method.
     */
    static Convert(callback) {
        return (target, property) => {
            this.assignToRVColumn(target.constructor, String(property), {
                caster: callback
            });
        };
    }
    /**
     * Decorates the specified property to be a required column.
     * @returns Returns the decorator method.
     */
    static Required() {
        return (target, property) => {
            const column = this.assignToRVColumn(target.constructor, String(property), {
                required: true
            });
            const index = column.validations.findIndex(validator => validator instanceof Validator.Common.Undefined);
            if (index !== -1) {
                column.validations.splice(index, 1);
            }
        };
    }
    /**
     * Decorates the specified property to be a hidden column.
     * @returns Returns the decorator method.
     */
    static Hidden() {
        return (target, property) => {
            this.assignToRVColumn(target.constructor, String(property), {
                hidden: true
            });
        };
    }
    /**
     * Decorates the specified property to be a read-only column.
     * @returns Returns the decorator method.
     * @throws Throws an error when the column is already write-only.
     */
    static ReadOnly() {
        return (target, property) => {
            const column = this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
                readOnly: true
            });
            if (column.writeOnly) {
                throw new Error(`Column '${String(property)}' is already write-only.`);
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
            const column = this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
                writeOnly: true
            });
            if (column.readOnly) {
                throw new Error(`Column '${String(property)}' is already read-only.`);
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
            return this.addValidation(target, this.assignToColumn(localModel, "virtual" /* Virtual */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(localModel, "virtual" /* Virtual */, String(property), {
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
            this.assignToStorage(target.constructor, {
                primary: String(property)
            });
        };
    }
    /**
     * Decorates the specified property to be an Id column.
     * @returns Returns the decorator method.
     */
    static Id() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property)), new Validator.Common.Any(), 0 /* Id */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a column that accepts null values.
     * @returns Returns the decorator method.
     */
    static Null() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property)), new Validator.Common.Null(), 1 /* Null */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a binary column.
     * @returns Returns the decorator method.
     */
    static Binary() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property)), new Validator.Common.Any(), 2 /* Binary */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be a boolean column.
     * @returns Returns the decorator method.
     */
    static Boolean() {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property)), new Validator.Common.Boolean(), 3 /* Boolean */, descriptor);
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
                values: values
            }), new Validator.Common.Enumeration(...values), 8 /* Enumeration */, descriptor);
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
                pattern: pattern
            }), new Validator.Common.Pattern(pattern, name), 9 /* Pattern */, descriptor);
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
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
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
                model: model
            }), new Validator.Common.InstanceOf(Object), 13 /* Map */, descriptor);
        };
    }
    /**
     * Decorates the specified property to be an object column.
     * @param model Model type.
     * @returns Returns the decorator method.
     */
    static Object(model) {
        return (target, property, descriptor) => {
            return this.addValidation(target, this.assignToColumn(target.constructor, "real" /* Real */, String(property), {
                model: model
            }), new Validator.Common.InstanceOf(Object), 14 /* Object */, descriptor);
        };
    }
};
/**
 * Map of storages.
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
], Schema, "freezeRowColumns", null);
__decorate([
    Class.Private()
], Schema, "assignToStorage", null);
__decorate([
    Class.Private()
], Schema, "findInStorages", null);
__decorate([
    Class.Private()
], Schema, "assignToColumn", null);
__decorate([
    Class.Private()
], Schema, "assignToRVColumn", null);
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
], Schema, "tryRows", null);
__decorate([
    Class.Public()
], Schema, "getRows", null);
__decorate([
    Class.Public()
], Schema, "tryRealRow", null);
__decorate([
    Class.Public()
], Schema, "getRealRow", null);
__decorate([
    Class.Public()
], Schema, "tryVirtualRow", null);
__decorate([
    Class.Public()
], Schema, "getVirtualRow", null);
__decorate([
    Class.Public()
], Schema, "tryRealColumn", null);
__decorate([
    Class.Public()
], Schema, "getRealColumn", null);
__decorate([
    Class.Public()
], Schema, "tryPrimaryColumn", null);
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