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
  private static addValidation(scope: Object, column: Columns.Real, validator: Validator.Format, format: Types.Format, descriptor?: PropertyDescriptor): PropertyDescriptor {
    if (column.validations.length === 0) {
      const validation = new Validator.Common.Group(Validator.Common.Group.OR, column.validations);
      descriptor = <PropertyDescriptor>Validator.Validate(validation)(scope, column.name, descriptor);
      descriptor.enumerable = true;
    }
    column.formats.push(format);
    column.validations.push(validator);
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
      storage = {
        name: type.name,
        ...properties,
        real: {},
        virtual: {}
      };
      this.storages.set(type, storage);
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
      throw new Error(`A virtual column named '${name}' already exists.`);
    }
    if (name in storage.real) {
      Object.assign(storage.real[name], properties);
    } else {
      storage.real[name] = {
        ...properties,
        type: 'real',
        name: name,
        views: [new RegExp(`^${name}$`)],
        formats: [],
        validations: []
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
      throw new Error(`A real column named '${name}' already exists.`);
    }
    if (!(name in storage.virtual)) {
      storage.virtual[name] = {
        type: 'virtual',
        name: name,
        views: [new RegExp(`^${name}$`)],
        foreign: foreign,
        local: local,
        model: model
      };
    }
    return storage.virtual[name];
  }

  /**
   * Assign all properties into a real or virtual column schema that corresponds to the specified entity type an column name.
   * @param type Entity type.
   * @param name Column name.
   * @param properties Column properties.
   * @returns Returns the assigned column schema.
   */
  @Class.Private()
  private static assignRealOrVirtualColumn(type: any, name: string, properties?: Types.Entity): Columns.Real | Columns.Virtual {
    const storage = this.assignStorage(type);
    if (name in storage.virtual) {
      Object.assign(storage.virtual[name], properties);
      return storage.real[name];
    } else if (name in storage.real) {
      Object.assign(storage.real[name], properties);
      return storage.real[name];
    } else {
      throw new Error(`There's no column '${name}'.`);
    }
  }

  /**
   * Determines whether the specified model is a valid entity.
   * @param model Entity model.
   * @returns Returns true when the specified model is a valid entity, false otherwise.
   */
  @Class.Public()
  public static isEntity(model: Types.Model): boolean {
    if (model && model.prototype) {
      return this.storages.has(model.prototype.constructor);
    }
    return false;
  }

  /**
   * Determines whether one view in the given view list exists in the specified column schema.
   * @param views List of views.
   * @param column Column base schema.
   * @returns Returns true when the view is valid or false otherwise.
   */
  @Class.Public()
  public static isView(column: Columns.Base, ...views: string[]): boolean {
    for (const view of views) {
      if (view === Types.View.ALL || column.views.some((current: RegExp) => current.test(view))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the real row schema from the specified entity model and list of view modes.
   * @param model Entity model.
   * @param views List of view modes.
   * @returns Returns the row schema or undefined when the entity model does not exists.
   * @throws Throws an error when the entity model isn't valid.
   */
  @Class.Public()
  public static getRealRow(model: Types.Model, ...views: string[]): Columns.RealRow {
    const storage = this.storages.get(model.prototype.constructor);
    if (!storage) {
      throw new Error(`Invalid entity model '${model.prototype.constructor.name}', impossible to get real rows.`);
    }
    const row = <Columns.RealRow>{};
    for (const name in storage.real) {
      const column = <Columns.Real>{ ...storage.real[name] };
      if (this.isView(column, ...views)) {
        row[name] = Object.freeze(column);
      }
    }
    return Object.freeze(row);
  }

  /**
   * Gets the virtual row schema from the specified entity model and list of view modes.
   * @param model Entity model.
   * @param views List of view modes.
   * @returns Returns the joined schema or undefined when the entity model does not exists.
   * @throws Throws an error when the entity model isn't valid.
   */
  @Class.Public()
  public static getVirtualRow(model: Types.Model, ...views: string[]): Columns.VirtualRow {
    const storage = this.storages.get(model.prototype.constructor);
    if (!storage) {
      throw new Error(`Invalid entity model '${model.prototype.constructor.name}', impossible to get virtual rows.`);
    }
    const row = <Columns.VirtualRow>{};
    for (const name in storage.virtual) {
      const column = storage.virtual[name];
      if (this.isView(column, ...views)) {
        row[name] = Object.freeze({ ...column });
      }
    }
    return Object.freeze(row);
  }

  /**
   * Gets the joint row schema from the specified entity model and list of view modes.
   * @param model Entity model.
   * @param views List of view modes.
   * @returns Returns the virtual columns list.
   */
  @Class.Public()
  public static getJointRow(model: Types.Model, ...views: string[]): Columns.JointRow {
    const columns = this.getVirtualRow(model, ...views);
    const row = <Columns.JointRow>{};
    for (const name in columns) {
      const schema = columns[name];
      const local = this.getRealColumn(model, schema.local);
      const foreign = this.getRealColumn(schema.model, schema.foreign);
      row[name] = Object.freeze(<Columns.Joint>{
        ...schema,
        type: 'joint',
        local: local.alias || local.name,
        foreign: foreign.alias || foreign.name,
        multiple: local.formats.includes(Types.Format.ARRAY)
      });
    }
    return Object.freeze(row);
  }

  /**
   * Gets the real column schema from the specified entity model and column name.
   * @param model Entity model.
   * @param name Column name.
   * @returns Returns the column schema or undefined when the column does not exists.
   * @throws Throws an error when the entity model isn't valid or the specified column was not found.
   */
  @Class.Public()
  public static getRealColumn(model: Types.Model, name: string): Columns.Real {
    const storage = this.storages.get(model.prototype.constructor);
    if (!storage) {
      throw new Error(`Invalid entity model '${model.prototype.constructor.name}', impossible to get the specified column.`);
    }
    if (!(name in storage.real)) {
      throw new Error(`Column '${name}' does not exists in the entity '${storage.name}'.`);
    }
    return Object.freeze({ ...storage.real[name] });
  }

  /**
   * Gets the primary column schema from the specified entity model.
   * @param model Entity model.
   * @returns Returns the column schema or undefined when the column does not exists.
   * @throws Throws an error when the entity model isn't valid or the primary column was not defined
   */
  @Class.Public()
  public static getPrimaryColumn(model: Types.Model): Columns.Real {
    const storage = this.storages.get(model.prototype.constructor);
    if (!storage) {
      throw Error(`Invalid entity model '${model.prototype.constructor}', impossible to get the primary column.`);
    }
    if (!storage.primary) {
      throw Error(`Entity '${storage.name}' without primary column.`);
    }
    return this.getRealColumn(model, <string>storage.primary);
  }

  /**
   * Gets the storage name from the specified entity model.
   * @param model Entity model.
   * @returns Returns the storage name or undefined when the entity does not exists.
   * @throws Throws an error when the entity model isn't valid.
   */
  @Class.Public()
  public static getStorage(model: Types.Model): string {
    const storage = this.storages.get(model.prototype.constructor);
    if (!storage) {
      throw Error(`Invalid entity model '${model.prototype.constructor}', impossible to get the storage name.`);
    }
    return storage.name;
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
  public static Alias(name: string): PropertyDecorator {
    return (scope: Object, property: PropertyKey): any => {
      this.assignRealColumn(scope.constructor, <string>property, { alias: name });
    };
  }

  /**
   * Decorates the specified property to be visible only in specific scenarios.
   * @param views List of views.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Views(...views: RegExp[]): PropertyDecorator {
    return (scope: Object, property: PropertyKey): any => {
      this.assignRealOrVirtualColumn(scope.constructor, <string>property, { views: views });
    };
  }

  /**
   * Decorates the specified property to convert its input and output values.
   * @param callback Converter callback.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Convert(callback: Types.Converter): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealOrVirtualColumn(scope.constructor, <string>property, { converter: callback });
    };
  }

  /**
   * Decorates the specified property to be a required column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Required(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealOrVirtualColumn(scope.constructor, <string>property, { required: true });
    };
  }

  /**
   * Decorates the specified property to be a hidden column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Hidden(): PropertyDecorator {
    return (scope: Object, property: PropertyKey): void => {
      this.assignRealOrVirtualColumn(scope.constructor, <string>property, { hidden: true });
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
      return this.addValidation(scope, this.assignRealColumn(scope.constructor, <string>property), new Validator.Common.Any(), Types.Format.ID, descriptor);
    };
  }

  /**
   * Decorates the specified property to be a column that accepts null values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Null(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(scope, this.assignRealColumn(scope.constructor, <string>property), new Validator.Common.Null(), Types.Format.NULL, descriptor);
    };
  }

  /**
   * Decorates the specified property to be a binary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Binary(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(scope, this.assignRealColumn(scope.constructor, <string>property), new Validator.Common.Any(), Types.Format.BINARY, descriptor);
    };
  }

  /**
   * Decorates the specified property to be a boolean column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Boolean(): PropertyDecorator {
    return (scope: Object, property: PropertyKey, descriptor?: PropertyDescriptor): PropertyDescriptor => {
      return this.addValidation(scope, this.assignRealColumn(scope.constructor, <string>property), new Validator.Common.Boolean(), Types.Format.BOOLEAN, descriptor);
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
        this.assignRealColumn(scope.constructor, <string>property, { minimum: minimum, maximum: maximum }),
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
        this.assignRealColumn(scope.constructor, <string>property, { minimum: minimum, maximum: maximum }),
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
        this.assignRealColumn(scope.constructor, <string>property, { minimum: minimum, maximum: maximum }),
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
        this.assignRealColumn(scope.constructor, <string>property, { minimum: minimum, maximum: maximum }),
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
        this.assignRealColumn(scope.constructor, <string>property, { values: values }),
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
        this.assignRealColumn(scope.constructor, <string>property, { pattern: pattern }),
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
      return this.addValidation(scope, this.assignRealColumn(scope.constructor, <string>property), new Validator.Common.Timestamp(min, max), Types.Format.TIMESTAMP, descriptor);
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
      return this.addValidation(scope, this.assignRealColumn(scope.constructor, <string>property), new Validator.Common.Timestamp(minimum, maximum), Types.Format.DATE, descriptor);
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
        this.assignRealColumn(scope.constructor, <string>property, { model: model }),
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
        this.assignRealColumn(scope.constructor, <string>property, { model: model }),
        new Validator.Common.InstanceOf(Object),
        Types.Format.OBJECT,
        descriptor
      );
    };
  }
}
