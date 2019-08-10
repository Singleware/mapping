/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';

import * as Types from './types';
import * as Columns from './columns';
import * as Filters from './filters';
import * as Castings from './castings';

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
  private static addValidation<E extends Types.Entity>(
    scope: Object,
    column: Columns.Real<E>,
    validator: Validator.Format,
    format: Types.Format,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor {
    if (column.validations.length === 0) {
      const validation = new Validator.Common.Group(Validator.Common.Group.OR, column.validations);
      descriptor = <PropertyDescriptor>Validator.Validate(validation)(scope, column.name, descriptor);
      descriptor.enumerable = true;
      column.validations.push(new Validator.Common.Undefined());
    }
    column.formats.push(format);
    column.validations.push(validator);
    return <PropertyDescriptor>descriptor;
  }

  /**
   * Assign all properties into the storage that corresponds to the specified model type.
   * @param model Model type.
   * @param properties Storage properties.
   * @returns Returns the assigned storage object.
   */
  @Class.Private()
  private static assignStorage(model: Types.Model, properties?: Types.Entity): Types.Storage {
    let storage = this.storages.get(model);
    if (storage) {
      Object.assign(storage, properties);
    } else {
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
  @Class.Private()
  private static assignColumn(model: Types.Model, type: Types.Column, name: string, properties?: Types.Entity): Columns.Base {
    const storage = <Types.Entity>this.assignStorage(model);
    const row = storage[type];
    if (type === Types.Column.Real && name in storage.virtual) {
      throw new Error(`A virtual column named '${name}' already exists.`);
    } else if (type === Types.Column.Virtual && name in storage.real) {
      throw new Error(`A real column named '${name}' already exists.`);
    }
    if (name in row) {
      Object.assign(row[name], properties);
    } else {
      row[name] = {
        ...properties,
        type: type,
        name: name,
        formats: [],
        validations: [],
        caster: (value: any) => value
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
  @Class.Private()
  private static assignRealOrVirtualColumn(model: Types.Model, name: string, properties?: Types.Entity): Columns.Real | Columns.Virtual {
    const storage = this.assignStorage(model);
    if (name in storage.virtual) {
      Object.assign(storage.virtual[name], properties);
      return storage.virtual[name];
    } else if (name in storage.real) {
      Object.assign(storage.real[name], properties);
      return storage.real[name];
    } else {
      throw new Error(`There's no virtual or real '${name}' column.`);
    }
  }

  /**
   * Determines whether the specified value is a valid entity.
   * @param value Model type.
   * @returns Returns true when the specified value is a valid entity, false otherwise.
   */
  @Class.Public()
  public static isEntity<E extends Types.Entity>(value: Types.Model<E>): boolean {
    return value && value.prototype && this.storages.has(value.prototype.constructor);
  }

  /**
   * Determines whether the specified column schema is visible based on the given fields.
   * @param column Column schema.
   * @param fields Viewed fields.
   * @returns Returns true when the view is valid or false otherwise.
   */
  @Class.Public()
  public static isVisible<E extends Types.Entity>(column: Columns.Base<E>, ...fields: string[]): boolean {
    if (fields.length > 0) {
      return fields.includes(column.name);
    }
    return true;
  }

  /**
   * Gets the real row schema from the specified model type and fields.
   * @param model Model type.
   * @param fields Fields to be selected.
   * @returns Returns the real row schema.
   * @throws Throws an error when the model type isn't valid.
   */
  @Class.Public()
  public static getRealRow(model: Types.Model, ...fields: string[]): Columns.RealRow {
    const last = Reflect.getPrototypeOf(Function);
    const row = <Columns.RealRow>{};
    let type, storage;
    do {
      type = model.prototype.constructor;
      if (this.storages.has(type)) {
        storage = <Types.Storage>this.storages.get(type);
        for (const name in storage.real) {
          const column = <Columns.Real>{ ...storage.real[name] };
          if (this.isVisible(column, ...fields) && !(name in row)) {
            row[name] = Object.freeze(column);
          }
        }
      }
    } while ((model = <any>Reflect.getPrototypeOf(type)) !== last);
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
  @Class.Public()
  public static getVirtualRow(model: Types.Model, ...fields: string[]): Columns.VirtualRow {
    const last = Reflect.getPrototypeOf(Function);
    const row = <Columns.VirtualRow>{};
    let type, storage;
    do {
      type = model.prototype.constructor;
      if (this.storages.has(type)) {
        storage = <Types.Storage>this.storages.get(type);
        for (const name in storage.virtual) {
          const column = storage.virtual[name];
          if (this.isVisible(column, ...fields) && !(name in row)) {
            row[name] = Object.freeze({ ...column });
          }
        }
      }
    } while ((model = <any>Reflect.getPrototypeOf(type)) !== last);
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
  @Class.Public()
  public static getRealColumn<E extends Types.Entity>(model: Types.Model<E>, name: string): Columns.Real<E> {
    const last = Reflect.getPrototypeOf(Function);
    let type, storage;
    do {
      type = model.prototype.constructor;
      if (this.storages.has(type)) {
        storage = <Types.Storage>this.storages.get(type);
        if (name in storage.real) {
          return <Columns.Real<E>>Object.freeze({ ...storage.real[name] });
        }
      }
    } while ((model = <any>Reflect.getPrototypeOf(type)) !== last);
    if (storage) {
      throw new Error(`Column '${name}' does not exists in the entity '${storage.name}'.`);
    } else {
      throw new Error(`Invalid model type '${type.name}', unable to get the column '${name}'.`);
    }
  }

  /**
   * Gets the primary column schema from the specified model type.
   * @param model Model type.
   * @returns Returns the column schema or undefined when the column does not exists.
   * @throws Throws an error when the entity model isn't valid or the primary column was not defined
   */
  @Class.Public()
  public static getPrimaryColumn<E extends Types.Entity>(model: Types.Model<E>): Columns.Real<E> {
    const last = Reflect.getPrototypeOf(Function);
    let type, storage;
    do {
      type = model.prototype.constructor;
      if (this.storages.has(type)) {
        storage = <Types.Storage>this.storages.get(type);
        if (storage.primary) {
          return <Columns.Real<E>>Object.freeze({ ...storage.real[storage.primary] });
        }
      }
    } while ((model = <any>Reflect.getPrototypeOf(type)) !== last);
    if (storage) {
      throw Error(`Entity '${storage.name}' without primary column.`);
    } else {
      throw Error(`Invalid model type '${type.name}', unable to get the primary column.`);
    }
  }

  /**
   * Gets the storage name from the specified model type.
   * @param model Model type.
   * @returns Returns the storage name.
   * @throws Throws an error when the model type isn't valid.
   */
  @Class.Public()
  public static getStorageName(model: Types.Model): string {
    const type = model.prototype.constructor;
    const storage = this.storages.get(type);
    if (!storage) {
      throw Error(`Invalid model type '${type.name}', unable to get the storage name.`);
    }
    return storage.name;
  }

  /**
   * Gets the column name from the specified column schema.
   * @param column Column schema.
   * @returns Returns the column name.
   */
  @Class.Public()
  public static getColumnName<I extends Types.Entity>(column: Columns.Base<I>): string {
    return (column as Columns.Real<I>).alias || column.name;
  }

  /**
   * Decorates the specified class to be an entity model.
   * @param name Storage name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Entity(name: string): ClassDecorator {
    return (model: any): void => {
      this.assignStorage(model.prototype.constructor, { name: name });
    };
  }

  /**
   * Decorates the specified property to be referenced by another property name.
   * @param name Alias name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Alias(name: string): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey): any => {
      this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { alias: name });
    };
  }

  /**
   * Decorates the specified property to convert its input and output value.
   * @param callback Caster callback.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Convert(callback: Types.Caster): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealOrVirtualColumn(<Types.Model>scope.constructor, <string>property, { caster: callback });
    };
  }

  /**
   * Decorates the specified property to be a required column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Required(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      const column = this.assignRealOrVirtualColumn(<Types.Model>scope.constructor, <string>property, { required: true });
      const index = column.validations.findIndex((validator: Validator.Format) => validator instanceof Validator.Common.Undefined);
      column.validations.splice(index, 1);
    };
  }

  /**
   * Decorates the specified property to be a hidden column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Hidden(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealOrVirtualColumn(<Types.Model>scope.constructor, <string>property, { hidden: true });
    };
  }

  /**
   * Decorates the specified property to be a read-only column.
   * @returns Returns the decorator method.
   * @throws Throws an error when the column is already write-only.
   */
  @Class.Public()
  public static ReadOnly(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      const column = this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { readOnly: true });
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
  public static WriteOnly(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      const column = this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { writeOnly: true });
      if (column.readOnly) {
        throw new Error(`Column '${property as string}' is already read-only.`);
      }
    };
  }

  /**
   * Decorates the specified property to be a virtual column of a foreign entity.
   * @param foreign Foreign column name.
   * @param model Foreign entity model.
   * @param local Local id column name.
   * @param match Column matching filter.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Join<E extends Types.Entity>(
    foreign: string,
    model: Types.Model<E>,
    local: string,
    match?: Filters.Match
  ): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const localModel = <Types.Model>scope.constructor;
      const localSchema = this.getRealColumn(localModel, local);
      const foreignSchema = this.getRealColumn(model, foreign);
      const multiple = localSchema.formats.includes(Types.Format.Array);
      return this.addValidation(
        scope,
        this.assignColumn(localModel, Types.Column.Virtual, <string>property, {
          local: localSchema.alias || localSchema.name,
          foreign: foreignSchema.alias || foreignSchema.name,
          multiple: multiple,
          model: model,
          query: {
            pre: match
          }
        }),
        new Validator.Common.InstanceOf(multiple ? Array : model),
        multiple ? Types.Format.Array : Types.Format.Object,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a virtual column of a foreign entity list.
   * @param foreign Foreign column name.
   * @param model Foreign entity model.
   * @param local Local id column name.
   * @param query Column query filter.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static JoinAll<E extends Types.Entity>(
    foreign: string,
    model: Types.Model<E>,
    local: string,
    query?: Filters.Query
  ): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      const localModel = <Types.Model>scope.constructor;
      const localSchema = this.getRealColumn(localModel, local);
      const foreignSchema = this.getRealColumn(model, foreign);
      return this.addValidation(
        scope,
        this.assignColumn(localModel, Types.Column.Virtual, <string>property, {
          local: localSchema.alias || localSchema.name,
          foreign: foreignSchema.alias || foreignSchema.name,
          multiple: localSchema.formats.includes(Types.Format.Array),
          query: query,
          model: model,
          all: true
        }),
        new Validator.Common.InstanceOf(Array),
        Types.Format.Array,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a primary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Primary(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignStorage(<Types.Model>scope.constructor, { primary: <string>property });
    };
  }

  /**
   * Decorates the specified property to be an Id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Id(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property),
        new Validator.Common.Any(),
        Types.Format.Id,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a column that accepts null values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Null(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property),
        new Validator.Common.Null(),
        Types.Format.Null,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a binary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Binary(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property),
        new Validator.Common.Any(),
        Types.Format.Binary,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a boolean column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Boolean(): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property),
        new Validator.Common.Boolean(),
        Types.Format.Boolean,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be an integer column.
   * @param minimum Minimum value.
   * @param maximum Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Integer(minimum?: number, maximum?: number): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { minimum: minimum, maximum: maximum }),
        new Validator.Common.Integer(minimum, maximum),
        Types.Format.Integer,
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
  public static Decimal(minimum?: number, maximum?: number): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { minimum: minimum, maximum: maximum }),
        new Validator.Common.Decimal(minimum, maximum),
        Types.Format.Decimal,
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
  public static Number(minimum?: number, maximum?: number): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { minimum: minimum, maximum: maximum }),
        new Validator.Common.Number(minimum, maximum),
        Types.Format.Number,
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
  public static String(minimum?: number, maximum?: number): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { minimum: minimum, maximum: maximum }),
        new Validator.Common.String(minimum, maximum),
        Types.Format.String,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be an enumeration column.
   * @param values Enumeration values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Enumeration(...values: string[]): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { values: values }),
        new Validator.Common.Enumeration(...values),
        Types.Format.Enumeration,
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
  public static Pattern(pattern: RegExp, name?: string): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { pattern: pattern }),
        new Validator.Common.Pattern(pattern, name),
        Types.Format.Pattern,
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
  public static Timestamp(min?: Date, max?: Date): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property),
        new Validator.Common.Timestamp(min, max),
        Types.Format.Timestamp,
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
  public static Date(minimum?: Date, maximum?: Date): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, {
          caster: Castings.ISODate.Object.bind(Castings.ISODate)
        }),
        new Validator.Common.Timestamp(minimum, maximum),
        Types.Format.Date,
        descriptor
      );
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
  @Class.Public()
  public static Array(model: Types.Model, unique?: boolean, minimum?: number, maximum?: number): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, {
          model: model,
          unique: unique,
          minimum: minimum,
          maximum: maximum
        }),
        new Validator.Common.InstanceOf(Array),
        Types.Format.Array,
        descriptor
      );
    };
  }

  /**
   * Decorates the specified property to be a map column.
   * @param model Model type.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Map(model: Types.Model): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { model: model }),
        new Validator.Common.InstanceOf(Object),
        Types.Format.Map,
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
  public static Object(model: Types.Model): Types.PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(
        scope,
        this.assignColumn(<Types.Model>scope.constructor, Types.Column.Real, <string>property, { model: model }),
        new Validator.Common.InstanceOf(model),
        Types.Format.Object,
        descriptor
      );
    };
  }
}
