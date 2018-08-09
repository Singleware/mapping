/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Types from '@singleware/types';

import { PropertyDecorator, ClassConstructor } from './types';
import { Entity } from './entity';
import { Formats } from './formats';
import { Storage } from './storage';
import { Column } from './column';
import { Row } from './row';

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
  private static setFormat(column: Column, prototype: any, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor {
    if (column.validators.length > 0) {
      return <PropertyDescriptor>descriptor;
    }
    return Types.Validate(column.validators)(prototype, property, descriptor);
  }

  /**
   * Sets a storage for the specified entity type.
   * @param type Entity type.
   * @returns Returns the entity type.
   */
  @Class.Private()
  private static setStorage(type: any): Storage {
    let storage = Schema.storages.get(type);
    if (!storage) {
      Schema.storages.set(type, (storage = { row: {} }));
    }
    return storage;
  }

  /**
   * Sets a column schema for the specified column type and name.
   * @param type Column type.
   * @param name Column name.
   * @returns Returns the column schema.
   */
  @Class.Private()
  private static setColumn(type: any, name: string): Column {
    const storage = Schema.setStorage(type);
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
  @Class.Private()
  private static loadColumn(column: Column): Column {
    const newer = { ...column };
    if (newer.model) {
      newer.schema = Schema.getRow(newer.model);
    }
    return Object.freeze(newer);
  }

  /**
   * Gets the row schema for the specified entity model.
   * @param model Entity model.
   * @returns Returns the row schema or undefined when the row schema does not exists.
   */
  @Class.Public()
  public static getRow<T extends Entity>(model: ClassConstructor<T>): Row | undefined {
    const storage = Schema.setStorage(model.prototype.constructor);
    if (storage) {
      const row = <Row>{ ...storage.row };
      for (const name in row) {
        row[name] = Schema.loadColumn(row[name]);
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
  @Class.Public()
  public static getColumn<T extends Entity>(model: ClassConstructor<T>, name: string): Column | undefined {
    const storage = Schema.setStorage(model.prototype.constructor);
    if (storage) {
      return name in storage.row ? Schema.loadColumn(storage.row[name]) : void 0;
    }
    return void 0;
  }

  /**
   * Gets the primary column schema for the specified entity model.
   * @param model Entity model.
   * @returns Returns the column schema or undefined when the column does not exists.
   */
  @Class.Public()
  public static getPrimaryColumn<T extends Entity>(model: ClassConstructor<T>): Column | undefined {
    const storage = Schema.storages.get(model.prototype.constructor);
    return storage ? Schema.getColumn(model, <string>storage.primary) : void 0;
  }

  /**
   * Gets the storage name for the specified entity model.
   * @param model Entity model.
   * @returns Returns the storage name or undefined when the entity does not exists.
   */
  @Class.Public()
  public static getStorageName<T extends Entity>(model: ClassConstructor<T>): string | undefined {
    const storage = Schema.storages.get(model.prototype.constructor);
    return storage ? storage.name : void 0;
  }

  /**
   * Decorates the specified class to be an entity model.
   * @param name Storage name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Entity(name: string): ClassDecorator {
    return Class.bindCallback(
      <T extends Object>(model: ClassConstructor<T>): void => {
        Schema.setStorage(model.prototype.constructor).name = name;
      }
    );
  }

  /**
   * Decorates the specified property to be formatted with another property name.
   * @param name Alias name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Alias(name: string): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string): void => {
        Schema.setColumn(prototype.constructor, property).alias = name;
      }
    );
  }

  /**
   * Decorates the specified property to be a required column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Required(): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string): void => {
        Schema.setColumn(prototype.constructor, property).required = true;
      }
    );
  }

  /**
   * Decorates the specified property to be a hidden column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Hidden(): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string): void => {
        Schema.setColumn(prototype.constructor, property).hidden = true;
      }
    );
  }

  /**
   * Decorates the specified property to be a primary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Primary(): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string): void => {
        Schema.setStorage(prototype.constructor).primary = property;
      }
    );
  }

  /**
   * Decorates the specified property to be an id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Id(): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.types.push(Formats.ID);
        column.validators.push(new Types.Common.Any());
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a column that accepts null values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Null(): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.types.push(Formats.NULL);
        column.validators.push(new Types.Common.Null());
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a boolean column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Boolean(): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.types.push(Formats.BOOLEAN);
        column.validators.push(new Types.Common.Boolean());
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a integer column.
   * @param min Minimum value.
   * @param max Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Integer(min?: number, max?: number): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.minimum = min;
        column.maximum = max;
        column.types.push(Formats.INTEGER);
        column.validators.push(new Types.Common.Integer(min, max));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a decimal column.
   * @param min Minimum value.
   * @param max Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Decimal(min?: number, max?: number): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.minimum = min;
        column.maximum = max;
        column.types.push(Formats.DECIMAL);
        column.validators.push(new Types.Common.Decimal(min, max));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a number column.
   * @param min Minimum value.
   * @param max Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Number(min?: number, max?: number): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.minimum = min;
        column.maximum = max;
        column.types.push(Formats.NUMBER);
        column.validators.push(new Types.Common.Number(min, max));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a string column.
   * @param min Minimum date.
   * @param max Maximum date.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static String(min?: number, max?: number): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.minimum = min;
        column.maximum = max;
        column.types.push(Formats.STRING);
        column.validators.push(new Types.Common.String(min, max));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a enumeration column.
   * @param values Enumeration values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Enumeration(...values: string[]): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.values = values;
        column.types.push(Formats.ENUMERATION);
        column.validators.push(new Types.Common.Enumeration(...values));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a string pattern column.
   * @param pattern Pattern expression.
   * @param alias Pattern alias name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Pattern(pattern: RegExp, alias?: string): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.pattern = pattern;
        column.types.push(Formats.PATTERN);
        column.validators.push(new Types.Common.Pattern(pattern, alias));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a timestamp column.
   * @param min Minimum date.
   * @param max Maximum date.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Timestamp(min?: Date, max?: Date): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.types.push(Formats.TIMESTAMP);
        column.validators.push(new Types.Common.Timestamp(min, max));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be a date column.
   * @param min Minimum date.
   * @param max Maximum date.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Date(min?: Date, max?: Date): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.types.push(Formats.DATE);
        column.validators.push(new Types.Common.Timestamp(min, max));
        return descriptor;
      }
    );
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
  public static Array<T extends Object>(model: ClassConstructor<T>, unique?: boolean, min?: number, max?: number): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.model = model;
        column.unique = unique;
        column.minimum = min;
        column.maximum = max;
        column.types.push(Formats.ARRAY);
        column.validators.push(new Types.Common.InstanceOf(Array));
        return descriptor;
      }
    );
  }

  /**
   * Decorates the specified property to be an object column.
   * @param model Entity model.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Object<T extends Object>(model: ClassConstructor<T>): PropertyDecorator {
    return Class.bindCallback(
      (prototype: any, property: string, descriptor?: PropertyDescriptor): PropertyDescriptor | undefined => {
        const column = Schema.setColumn(prototype.constructor, property);
        descriptor = Schema.setFormat(column, prototype, property, descriptor);
        column.model = model;
        column.types.push(Formats.OBJECT);
        column.validators.push(new Types.Common.InstanceOf(Object));
        return descriptor;
      }
    );
  }
}
