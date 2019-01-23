/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';

import * as Types from './types';
import * as Columns from './columns';

/**
 * Schema helper class.
 */
@Class.Describe()
export class Schema extends Class.Null {
  /**
   * Map of entity storages.
   */
  @Class.Private()
  private static storages: WeakMap<any, Types.Storage> = new WeakMap();

  /**
   * Sets the column validation format for the specified entity prototype.
   * @param column Column schema.
   * @param prototype Entity prototype.
   * @param property Entity property.
   * @param descriptor Entity descriptor.
   * @returns Returns the wrapped descriptor.
   */
  @Class.Private()
  private static setFormat(column: Columns.Real, prototype: Object, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor {
    if (column.validation.length === 0) {
      const grouping = new Validator.Common.Group(Validator.Common.Group.OR, column.validation);
      const wrapped = Validator.Validate(grouping)(prototype, property, descriptor);
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
  private static setStorage(type: any): Types.Storage {
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
  @Class.Private()
  private static setReal(type: any, name: string, format?: Types.Format): Columns.Real {
    const storage = this.setStorage(type);
    if (name in storage.virtual) {
      throw new Error(`A virtual column with the name '${name}' already exists.`);
    }
    if (!(name in storage.real)) {
      const column = <Columns.Real>{ name: name, formats: [], validation: [] };
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
  @Class.Private()
  private static setVirtual(type: any, name: string, foreign: string, model: Types.Model<Types.Entity>, local: string): Columns.Virtual {
    const storage = this.setStorage(type);
    if (name in storage.real) {
      throw new Error(`A real column with the name '${name}' already exists.`);
    }
    if (!(name in storage.virtual)) {
      const column = <Columns.Virtual>{ name: name, foreign: foreign, local: local, model: model };
      storage.virtual[name] = column;
    }
    return storage.virtual[name];
  }

  /**
   * Resolve any dependency in the specified real column schema to be used externally.
   * @param column Column schema.
   * @returns Returns the resolved column schema.
   */
  @Class.Private()
  private static resolveRealColumn(column: Columns.Real): Columns.Real {
    const newer = <Columns.Real>{ ...column };
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
  @Class.Public()
  public static getRealRow<T extends Types.Entity>(model: Types.Model<T>): Columns.RealRow | undefined {
    const storage = this.setStorage(model.prototype.constructor);
    if (storage) {
      const row = <Columns.RealRow>{ ...storage.real };
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
  @Class.Public()
  public static getVirtualRow<T extends Types.Entity>(model: Types.Model<T>): Columns.VirtualRow | undefined {
    const storage = this.setStorage(model.prototype.constructor);
    if (storage) {
      const row = <Columns.VirtualRow>{ ...storage.virtual };
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
  @Class.Public()
  public static getRealColumn<T extends Types.Entity>(model: Types.Model<T>, name: string): Columns.Real | undefined {
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
  @Class.Public()
  public static getPrimaryColumn<T extends Types.Entity>(model: Types.Model<T>): Columns.Real | undefined {
    const storage = this.storages.get(model.prototype.constructor);
    if (storage) {
      return this.getRealColumn(model, <string>storage.primary);
    }
    return void 0;
  }

  /**
   * Gets the storage name from the specified entity model.
   * @param model Entity model.
   * @returns Returns the storage name or undefined when the entity does not exists.
   */
  @Class.Public()
  public static getStorage<T extends Types.Entity>(model: Types.Model<T>): string | undefined {
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
  @Class.Public()
  public static Entity(name: string): ClassDecorator {
    return (model: any): void => {
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
      this.setReal(scope.constructor, <string>property).alias = name;
    };
  }

  /**
   * Decorates the specified property to be a required column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Required(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.setReal(scope.constructor, <string>property).required = true;
    };
  }

  /**
   * Decorates the specified property to be a hidden column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Hidden(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.setReal(scope.constructor, <string>property).hidden = true;
    };
  }

  /**
   * Decorates the specified property to be a read-only column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static ReadOnly(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.setReal(scope.constructor, <string>property).readonly = true;
    };
  }

  /**
   * Decorates the specified property to be a write-only column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static WriteOnly(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.setReal(scope.constructor, <string>property).writeonly = true;
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
  public static Join(foreign: string, model: Types.Model, local: string): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      this.setVirtual(scope.constructor, <string>property, foreign, model, local);
      descriptor = <PropertyDescriptor>Validator.Validate(new Validator.Common.Any())(scope, property, descriptor);
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
      const column = this.setReal(scope.constructor, <string>property, Types.Format.ID);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.validation.push(new Validator.Common.Any());
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
      const column = this.setReal(scope.constructor, <string>property, Types.Format.NULL);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.validation.push(new Validator.Common.Null());
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
      const column = this.setReal(scope.constructor, <string>property, Types.Format.BINARY);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.validation.push(new Validator.Common.Any());
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
      const column = this.setReal(scope.constructor, <string>property, Types.Format.BOOLEAN);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Integer(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.INTEGER);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Decimal(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.DECIMAL);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Number(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.NUMBER);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static String(min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.STRING);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Enumeration(...values: string[]): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.ENUMERATION);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Pattern(pattern: RegExp, alias?: string): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.PATTERN);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Timestamp(min?: Date, max?: Date): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.TIMESTAMP);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Date(min?: Date, max?: Date): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.DATE);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Array(model: Types.Model, unique?: boolean, min?: number, max?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.ARRAY);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Map(model: Types.Model): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.MAP);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
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
  @Class.Public()
  public static Object(model: Types.Model): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const column = this.setReal(scope.constructor, <string>property, Types.Format.OBJECT);
      descriptor = this.setFormat(column, scope, <string>property, descriptor);
      column.model = model;
      column.validation.push(new Validator.Common.InstanceOf(Object));
      return descriptor;
    };
  }
}
