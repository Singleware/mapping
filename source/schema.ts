/*
 * Copyright (C) 2018-2019 Silas B. Domingos
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
   * Adds the specified format validation into the provided column schema and property descriptor.
   * @param scope Entity scope.
   * @param column Column schema.
   * @param validator Data validator.
   * @param format Data format.
   * @param descriptor Property descriptor.
   * @returns Returns the wrapped property descriptor.
   */
  @Class.Private()
  private static addValidation(
    scope: Object,
    column: Columns.Real,
    validator: Validator.Format,
    format: Types.Format,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor {
    if (column.validation.length === 0) {
      const validation = new Validator.Common.Group(Validator.Common.Group.OR, column.validation);
      descriptor = <PropertyDescriptor>Validator.Validate(validation)(scope, column.name, descriptor);
      descriptor.enumerable = true;
    }
    column.formats.push(format);
    column.validation.push(validator);
    return <PropertyDescriptor>descriptor;
  }

  /**
   * Assign all properties into the storage that corresponds to the specified entity type.
   * @param type Entity type.
   * @param properties Storage properties.
   * @returns Returns the assigned storage object.
   */
  @Class.Private()
  private static assignStorage(type: any, properties?: Types.Entity): Types.Storage {
    let storage = this.storages.get(type);
    if (storage) {
      Object.assign(storage, properties);
    } else {
      this.storages.set(
        type,
        (storage = {
          ...properties,
          real: {},
          virtual: {}
        })
      );
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
  @Class.Private()
  private static assignRealColumn(type: any, name: string, properties?: Types.Entity): Columns.Real {
    const storage = this.assignStorage(type);
    if (name in storage.virtual) {
      throw new Error(`A virtual column with the name '${name}' already exists.`);
    }
    if (name in storage.real) {
      Object.assign(storage.real[name], properties);
    } else {
      storage.real[name] = {
        ...properties,
        name: name,
        formats: [],
        validation: []
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
   * @returns Returns the created column schema.
   */
  @Class.Private()
  private static assignVirtualColumn(type: any, name: string, foreign: string, model: Types.Model, local: string): Columns.Virtual {
    const storage = this.assignStorage(type);
    if (name in storage.real) {
      throw new Error(`A real column with the name '${name}' already exists.`);
    }
    if (!(name in storage.virtual)) {
      storage.virtual[name] = {
        name: name,
        foreign: foreign,
        local: local,
        model: model
      };
    }
    return storage.virtual[name];
  }

  /**
   * Gets the real row schema from the specified entity model.
   * @param model Entity model.
   * @param cache Recursivity cache.
   * @returns Returns the row schema or undefined when the entity model does not exists.
   */
  @Class.Public()
  public static getRealRow(model: Types.Model, cache?: WeakMap<Types.Model, Columns.RealRow>): Columns.RealRow | undefined {
    const storage = this.storages.get(model.prototype.constructor);
    if (storage) {
      const row = <Columns.RealRow>{};
      for (const name in storage.real) {
        const column = <Columns.Real>{ ...storage.real[name] };
        if (column.model) {
          cache = cache || new WeakMap<Types.Model, Columns.RealRow>();
          if (!(column.schema = cache.get(column.model))) {
            cache.set(column.model, (column.schema = <Columns.RealRow>this.getRealRow(column.model, cache)));
          }
        }
        row[name] = Object.freeze(column);
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
  public static getVirtualRow(model: Types.Model): Columns.VirtualRow | undefined {
    const storage = this.storages.get(model.prototype.constructor);
    if (storage) {
      return Object.freeze(<Columns.VirtualRow>{ ...storage.virtual });
    }
    return void 0;
  }

  /**
   * Gets the real column schema from the specified entity model and column name.
   * @param model Entity model.
   * @param name Column name.
   * @param cache Recursivity cache.
   * @returns Returns the column schema or undefined when the column does not exists.
   */
  @Class.Public()
  public static getRealColumn(model: Types.Model, name: string, cache?: WeakMap<Types.Model, Columns.RealRow>): Columns.Real | undefined {
    const storage = this.storages.get(model.prototype.constructor);
    if (storage && name in storage.real) {
      const column = <Columns.Real>{ ...storage.real[name] };
      if (column.model) {
        cache = cache || new WeakMap<Types.Model, Columns.RealRow>();
        if (!(column.schema = cache.get(column.model))) {
          cache.set(column.model, (column.schema = <Columns.RealRow>this.getRealRow(column.model, cache)));
        }
      }
      return Object.freeze(column);
    }
    return void 0;
  }

  /**
   * Gets the real primary column schema from the specified entity model.
   * @param model Entity model.
   * @returns Returns the column schema or undefined when the column does not exists.
   */
  @Class.Public()
  public static getRealPrimaryColumn(model: Types.Model): Columns.Real | undefined {
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
  public static getStorage(model: Types.Model): string | undefined {
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
      this.assignStorage(model.prototype.constructor, {
        name: name
      });
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
      this.assignRealColumn(scope.constructor, <string>property, { alias: name });
    };
  }

  /**
   * Decorates the specified property to be a required column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Required(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealColumn(scope.constructor, <string>property, { required: true });
    };
  }

  /**
   * Decorates the specified property to be a hidden column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Hidden(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealColumn(scope.constructor, <string>property, { hidden: true });
    };
  }

  /**
   * Decorates the specified property to be a read-only column.
   * @returns Returns the decorator method.
   * @throws Throws an error when the column is already write-only.
   */
  @Class.Public()
  public static ReadOnly(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      const column = this.assignRealColumn(scope.constructor, <string>property, { readOnly: true });
      if (column.writeOnly) {
        throw new Error(`Column '${property as string}' is already write-only.`);
      }
    };
  }

  /**
   * Decorates the specified property to be a write-only column.
   * @returns Returns the decorator method.
   * @throws Throws an error when the column is already read-only.
   */
  @Class.Public()
  public static WriteOnly(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      const column = this.assignRealColumn(scope.constructor, <string>property, { writeOnly: true });
      if (column.readOnly) {
        throw new Error(`Column '${property as string}' is already read-only.`);
      }
    };
  }

  /**
   * Decorates the specified property to be filtered.
   * @param callback Filter callback.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Filter(callback: Types.Filter): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealColumn(scope.constructor, <string>property, { filter: callback });
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
      this.assignVirtualColumn(scope.constructor, <string>property, foreign, model, local);
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
      this.assignStorage(scope.constructor, { primary: <string>property });
    };
  }

  /**
   * Decorates the specified property to be an id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Id(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property),
        new Validator.Common.Any(),
        Types.Format.ID,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a column that accepts null values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Null(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property),
        new Validator.Common.Null(),
        Types.Format.NULL,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a binary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Binary(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property),
        new Validator.Common.Any(),
        Types.Format.BINARY,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a boolean column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Boolean(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property),
        new Validator.Common.Boolean(),
        Types.Format.BOOLEAN,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a integer column.
   * @param minimum Minimum value.
   * @param maximum Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Integer(minimum?: number, maximum?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          minimum: minimum,
          maximum: maximum
        }),
        new Validator.Common.Integer(minimum, maximum),
        Types.Format.INTEGER,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a decimal column.
   * @param minimum Minimum value.
   * @param maximum Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Decimal(minimum?: number, maximum?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          minimum: minimum,
          maximum: maximum
        }),
        new Validator.Common.Decimal(minimum, maximum),
        Types.Format.DECIMAL,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a number column.
   * @param minimum Minimum value.
   * @param maximum Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Number(minimum?: number, maximum?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          minimum: minimum,
          maximum: maximum
        }),
        new Validator.Common.Number(minimum, maximum),
        Types.Format.NUMBER,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a string column.
   * @param minimum Minimum length.
   * @param maximum Maximum length.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static String(minimum?: number, maximum?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          minimum: minimum,
          maximum: maximum
        }),
        new Validator.Common.String(minimum, maximum),
        Types.Format.STRING,
        descriptor
      );
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
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          values: values
        }),
        new Validator.Common.Enumeration(...values),
        Types.Format.ENUMERATION,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a string pattern column.
   * @param pattern Pattern expression.
   * @param name Pattern name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Pattern(pattern: RegExp, name?: string): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          pattern: pattern
        }),
        new Validator.Common.Pattern(pattern, name),
        Types.Format.PATTERN,
        descriptor
      );
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
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property),
        new Validator.Common.Timestamp(min, max),
        Types.Format.TIMESTAMP,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a date column.
   * @param minimum Minimum date.
   * @param maximum Maximum date.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Date(minimum?: Date, maximum?: Date): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property),
        new Validator.Common.Timestamp(minimum, maximum),
        Types.Format.DATE,
        descriptor
      );
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
  @Class.Public()
  public static Array(model: Types.Model, unique?: boolean, minimum?: number, maximum?: number): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          model: model,
          unique: unique,
          minimum: minimum,
          maximum: maximum
        }),
        new Validator.Common.InstanceOf(Array),
        Types.Format.ARRAY,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be an map column.
   * @param model Model type.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Map(model: Types.Model): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          model: model
        }),
        new Validator.Common.InstanceOf(Object),
        Types.Format.MAP,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be an object column.
   * @param model Model type.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Object(model: Types.Model): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignRealColumn(scope.constructor, <string>property, {
          model: model
        }),
        new Validator.Common.InstanceOf(Object),
        Types.Format.OBJECT,
        descriptor
      );
    };
  }
}
