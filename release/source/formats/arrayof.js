"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const helper_1 = require("../helper");
/**
 * Array validator class.
 */
let ArrayOf = class ArrayOf extends Class.Null {
    /**
     * Default constructor.
     * @param type Expected type.
     */
    constructor(type) {
        super();
        this.type = type;
    }
    /**
     * Model class.
     */
    get model() {
        var _a;
        return (_a = helper_1.Helper.tryEntityModel(this.type)) !== null && _a !== void 0 ? _a : this.type;
    }
    /**
     * Determines whether or not the specified list of items contains only primitive types.
     * @param items List of items.
     * @returns Returns true when the list of items is valid, false otherwise.
     */
    validatePrimitives(items) {
        const type = this.type.name.toLowerCase();
        for (const item of items) {
            if (typeof item !== type) {
                return false;
            }
        }
        return true;
    }
    /**
     * Determines whether or not the specified list of items contains only object types.
     * @param items List of items.
     * @returns Returns true when the list of items is valid, false otherwise.
     */
    validateObjects(items) {
        const type = this.model;
        for (const item of items) {
            if (!(item instanceof type)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Validator name.
     */
    get name() {
        return `Array of ${this.model.name}`;
    }
    /**
     * Validate the specified data.
     * @param data Data to be validated.
     * @returns Returns true when the data is valid, false otherwise.
     */
    validate(data) {
        if (data instanceof Array) {
            switch (this.type) {
                case String:
                case Boolean:
                case Number:
                    return this.validatePrimitives(data);
                default:
                    return this.validateObjects(data);
            }
        }
        return false;
    }
};
__decorate([
    Class.Private()
], ArrayOf.prototype, "type", void 0);
__decorate([
    Class.Private()
], ArrayOf.prototype, "model", null);
__decorate([
    Class.Private()
], ArrayOf.prototype, "validatePrimitives", null);
__decorate([
    Class.Private()
], ArrayOf.prototype, "validateObjects", null);
__decorate([
    Class.Public()
], ArrayOf.prototype, "name", null);
__decorate([
    Class.Public()
], ArrayOf.prototype, "validate", null);
ArrayOf = __decorate([
    Class.Describe()
], ArrayOf);
exports.ArrayOf = ArrayOf;
//# sourceMappingURL=arrayof.js.map