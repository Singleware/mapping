/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Columns from './columns';

import { Schema } from './schema';

/**
 * Helper class.
 */
@Class.Describe()
export class Helper extends Class.Null {
  /**
   * Try to get the resolved model class from the specified model input.
   * @param input Model input.
   * @returns Returns the resolved model class or undefined.
   */
  @Class.Public()
  public static tryEntityModel<E extends Types.Entity>(input: Types.ModelInput<E>): Types.ModelClass<E> | undefined {
    if (input instanceof Function) {
      if (`${input.prototype ? input.prototype.constructor : input}`.startsWith('class')) {
        return <Types.ModelClass<E>>input;
      }
      return this.tryEntityModel((<Types.ModelCallback<E>>input)());
    }
    return void 0;
  }

  /**
   * Get the model class based on the specified model input.
   * @param input Model input.
   * @returns Returns the model class.
   * @throws Throws an error when the specified model input doesn't resolve to a model class.
   */
  @Class.Public()
  public static getEntityModel<E extends Types.Entity>(input: Types.ModelInput<E>): Types.ModelClass<E> {
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
  @Class.Public()
  public static tryPathColumns(model: Types.ModelClass, path: string): Readonly<Columns.Any>[] | undefined {
    let current: Types.ModelClass | undefined = model;
    const models = [];
    for (const field of path.split('.')) {
      if (current === void 0) {
        return void 0;
      } else {
        const schema = <Readonly<Columns.Any>>Schema.tryColumn(current, field);
        if (schema === void 0) {
          return void 0;
        }
        models.push(schema);
        if (schema.model !== void 0) {
          current = this.tryEntityModel(schema.model)!;
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
  @Class.Public()
  public static getPathColumns(model: Types.ModelClass, path: string): Readonly<Columns.Any>[] {
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
  @Class.Public()
  public static isEmptyModel<E extends Types.Entity>(model: Types.ModelClass<E>, entity: E, deep: number = 8): boolean {
    const columns = Schema.getRows(model);
    for (const name in columns) {
      const value = entity[name];
      const schema = columns[name];
      if (value instanceof Array) {
        if (schema.model && Schema.isEntity(schema.model)) {
          const resolved = Helper.getEntityModel(schema.model);
          for (const entry of value) {
            if (!this.isEmptyModel(resolved, entry, deep - 1)) {
              return false;
            }
          }
        } else if (value.length > 0) {
          return false;
        }
      } else if (value instanceof Object) {
        if (schema.model && Schema.isEntity(schema.model)) {
          if (deep < 0 || !this.isEmptyModel(this.getEntityModel(schema.model), value, deep - 1)) {
            return false;
          }
        } else if (Object.getPrototypeOf(value) === Object.getPrototypeOf({})) {
          if (Object.keys(value).length > 0) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (value !== void 0 && value !== null) {
          return false;
        }
      }
    }
    return true;
  }
}
