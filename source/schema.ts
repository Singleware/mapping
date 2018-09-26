/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '@singleware/types';

import { PropertyDecorator, ClassDecorator, Constructor } from './types';
import { Entity } from './entity';
import { Format } from './format';
import { Storage } from './storage';
import { Virtual } from './virtual';
import { Column } from './column';
import { Map } from './map';

/**
 * Schema helper class.
 */
@Class.Describe()
export class Schema {
  /**
   * Map of entity storages.
   */
  @Class.Private()
  private static storages: WeakMap<any, Storage> = new WeakMap();

  /**
   * Sets the column format for the specified entity prototype.
   * @param column Column schema.
   * @param prototype Entity prototype.
   * @param property Entity property
   * @param descriptor Entity descriptor.
   * @returns Returns the wrapped descriptor.
   */
  @Class.Private()
  private static setFormat(column: Column, scope: Object, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor {
    if (column.validators.length === 0) {
      const format = new Types.Common.Group(Types.Common.Group.OR, column.validators);
      const wrapped = Types.Validate(format)(scope, property, descriptor);
      wrapped.enumerable = true;
      return wrapped;
    }
    return <PropertyDescriptor>descriptor;
  }

  /**
   * Sets a storage for the specified entity type.
   * @param type Entity type.
   * @returns Returns the entity type.
   */
  @Class.Private()
  private static setStorage(type: any): Storage {
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
   * @returns Returns the join schema.
   */
  @Class.Private()
  private static registerVirtual(type: any, name: string, foreign: string): Virtual {
    const storage = this.setStorage(type);
    if (name in storage.columns) {
      throw new Error(`A column with the name '${name}' already exists.`);
    }
    if (!(name in storage.virtual)) {
      storage.virtual[name] = { name: name, foreign: foreign };
    }
    return storage.virtual[name];
  }

  /**
   * Register a column schema for the specified column information.
   * @param type Column type.
   * @param name Column name.
   * @returns Returns the column schema.
   */
  @Class.Private()
  private static registerColumn(type: any, name: string): Column {
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
  @Class.Private()
  private static resolveColumn(column: Column): Column {
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
  @Class.Public()
  public static getRow<T extends Entity>(model: Constructor<T>): Map<Column> | undefined {
    const storage = this.setStorage(model.prototype.constructor);
    if (storage) {
      const row = <Map<Column>>{ ...storage.columns };
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
  @Class.Public()
  public static getVirtual<T extends Entity>(model: Constructor<T>): Map<Virtual> | undefined {
    const storage = this.setStorage(model.prototype.constructor);
    if (storage) {
      return Object.freeze(<Map<Virtual>>{ ...storage.virtual });
    }
    return void 0;
  }

  /**
   * Gets the column schema for the specified entity model and column name.
   * @param model Entity model.
   * @param name Column name.
   * @returns Returns the column schema or undefined when the column does not exists.
   */
  @Class.Public()
  public static getColumn<T extends Entity>(model: Constructor<T>, name: string): Column | undefined {
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
  @Class.Public()
  public static getPrimary<T extends Entity>(model: Constructor<T>): Column | undefined {
    const storage = this.storages.get(model.prototype.constructor);
    return storage ? this.getColumn(model, <string>storage.primary) : void 0;
  }

  /**
   * Gets the storage name for the specified entity model.
   * @param model Entity model.
   * @returns Returns the storage name or undefined when the entity does not exists.
   */
  @Class.Public()
  public static getStorage<T extends Entity>(model: Constructor<T>): string | undefined {
    const storage = this.storages.get(model.prototype.constructor);
    return storage ? storage.name : void 0;
  }

  /**
   * Decorates the specified class to be an entity model.
   * @param name Storage name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Entity(name: string): ClassDecorator {
    return (model: Constructor): void => {
      this.setStorage(model.prototype.constructor).name = name;
    };
  }

  /**
   * Decorates the specified property to be referenced by another property name.
   * @param name Alias name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Alias(name: string): PropertyDecorator {
    return (scope: Object, property: PropertyKey): any => {
      this.registerColumn(scope.constructor, <string>property).alias = name;
    };
  }

  /**
   * Decorates the specified property to be a required column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Required(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.registerColumn(scope.constructor, <string>property).required = true;
    };
  }

  /**
   * Decorates the specified property to be a hidden column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Hidden(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.registerColumn(scope.constructor, <string>property).hidden = true;
    };
  }

  /**
   * Decorates the specified property to be virtual column of a foreign entity.
   * @param foreign Foreign column name.
   * @param model Foreign entity model.
   * @param local Local id column name. (When omitted the primary ID column will be used as default)
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Join(foreign: string, model?: Constructor<Entity>, local?: string): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const join = this.registerVirtual(scope.constructor, <string>property, foreign);
      descriptor = <PropertyDescriptor>Types.Validate(new Types.Common.Any())(scope, property, descriptor);
      join.local = local;
      join.model = model;
      descriptor.enumerable = true;
      return descriptor;
    };
  }

  /**
   * Decorates the specified property to be a primary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Primary(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.setStorage(scope.constructor).primary = <string>property;
    };
  }

  /**
   * Decorates the specified property to be an id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Id(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.types.push(Format.ID);
      column.validators.push(new Types.Common.Any());
      return descriptor;
    };
  }

  /**
   * Decorates the specified property to be a column that accepts null values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Null(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.types.push(Format.NULL);
      column.validators.push(new Types.Common.Null());
      return descriptor;
    };
  }

  /**
   * Decorates the specified property to be a binary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Binary(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.types.push(Format.BINARY);
      return descriptor;
    };
  }

  /**
   * Decorates the specified property to be a boolean column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Boolean(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.types.push(Format.BOOLEAN);
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
  @Class.Public()
  public static Integer(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.minimum = min;
      column.maximum = max;
      column.types.push(Format.INTEGER);
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
  @Class.Public()
  public static Decimal(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.minimum = min;
      column.maximum = max;
      column.types.push(Format.DECIMAL);
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
  @Class.Public()
  public static Number(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.minimum = min;
      column.maximum = max;
      column.types.push(Format.NUMBER);
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
  @Class.Public()
  public static String(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.minimum = min;
      column.maximum = max;
      column.types.push(Format.STRING);
      column.validators.push(new Types.Common.String(min, max));
      return descriptor;
    };
  }

  /**
   * Decorates the specified property to be a enumeration column.
   * @param values Enumeration values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Enumeration(...values: string[]): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.values = values;
      column.types.push(Format.ENUMERATION);
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
  @Class.Public()
  public static Pattern(pattern: RegExp, alias?: string): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.pattern = pattern;
      column.types.push(Format.PATTERN);
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
  @Class.Public()
  public static Timestamp(min?: Date, max?: Date): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.types.push(Format.TIMESTAMP);
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
  @Class.Public()
  public static Date(min?: Date, max?: Date): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.types.push(Format.DATE);
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
  @Class.Public()
  public static Array<T extends Object>(model: Constructor, unique?: boolean, min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.model = model;
      column.unique = unique;
      column.minimum = min;
      column.maximum = max;
      column.types.push(Format.ARRAY);
      column.validators.push(new Types.Common.InstanceOf(Array));
      return descriptor;
    };
  }

  /**
   * Decorates the specified property to be an map column.
   * @param model Entity model.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Map<T extends Object>(model: Constructor): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.model = model;
      column.types.push(Format.MAP);
      column.validators.push(new Types.Common.InstanceOf(Object));
      return descriptor;
    };
  }

  /**
   * Decorates the specified property to be an object column.
   * @param model Entity model.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Object<T extends Object>(model: Constructor): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.registerColumn(scope.constructor, <string>property);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.model = model;
      column.types.push(Format.OBJECT);
      column.validators.push(new Types.Common.InstanceOf(Object));
      return descriptor;
    };
  }
}
