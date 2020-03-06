"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Types = require("../types");
/**
 * Columns helper class.
 */
let Helper = class Helper extends Class.Null {
    /**
     * Gets the column name from the specified column schema.
     * @param schema Column schema.
     * @returns Returns the column name.
     */
    static getName(schema) {
        return schema.alias || schema.name;
    }
    /**
     * Get a new path based on the specified column schemas.
     * @param schemas Column schemas.
     * @returns Returns a new path generated from the column schemas.
     */
    static getPath(schemas) {
        let path = [];
        for (const current of schemas) {
            path.push(this.getName(current));
        }
        return path.join('.');
    }
    /**
     * Get all nested fields from the given column schema and the field list.
     * @param schema Column schema.
     * @param fields Fields to be selected.
     * @returns Returns a new field list containing all nested fields.
     */
    static getNestedFields(schema, fields) {
        const list = [];
        const prefix = `${this.getName(schema)}.`;
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
     * Determines whether or not the specified column is a real column.
     * @param column Column object.
     * @returns Returns true when the column is a real column, false otherwise.
     */
    static isReal(column) {
        return column.type === "real" /* Real */;
    }
    /**
     * Determines whether or not the specified column is a virtual column.
     * @param column Column object.
     * @returns Returns true when the column is a virtual column, false otherwise.
     */
    static isVirtual(column) {
        return column.type === "virtual" /* Virtual */;
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
};
__decorate([
    Class.Public()
], Helper, "getName", null);
__decorate([
    Class.Public()
], Helper, "getPath", null);
__decorate([
    Class.Public()
], Helper, "getNestedFields", null);
__decorate([
    Class.Public()
], Helper, "isReal", null);
__decorate([
    Class.Public()
], Helper, "isVirtual", null);
__decorate([
    Class.Public()
], Helper, "isVisible", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
//# sourceMappingURL=helper.js.map