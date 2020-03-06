/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as Validator from '@singleware/types';

import * as Types from './types';
import * as Columns from './columns';
import * as Filters from './filters';
import * as Castings from './castings';
import * as Formats from './formats';

import { Helper } from './helper';

/**
 * Schema class.
 */
@Class.Describe()
export class Schema extends Class.Null {
  /**
   * Map of storages.
   */
  @Class.Private()
  private static storages = new WeakMap<any, Types.Storage>();

  /**
   * Set the specified format validation into the given column schema and property descriptor.
   * @param target Model target.
   * @param schema Column schema.
   * @param validator Data validator.
   * @param format Data format.
   * @param descriptor Property descriptor.
   * @returns Returns the wrapped property descriptor.
   */
  @Class.Private()
  private static setValidation(
    target: Object,
    schema: Columns.Real,
    validator: Validator.Format,
    format: Types.Format,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor {
    if (schema.validations.length === 0) {
      const validation = new Validator.Common.Group(Validator.Common.Group.OR, schema.validations);
      descriptor = Validator.Validate(validation)(target, schema.name, descriptor);
      descriptor!.enumerable = true;
      schema.validations.push(new Formats.Undefined());
    }
    schema.formats.push(format);
    schema.validations.push(validator);
    return descriptor!;
  }

  /**
   * Freeze any column in the specified row schema.
   * @param row Row schema.
   * @returns Returns a new row schema.
   */
  @Class.Private()
  private static freezeRowColumns<T extends Columns.Real | Columns.Virtual>(row: Types.Map<T>): Columns.ReadonlyRow<T> {
    const newer = <Columns.ReadonlyRow<T>>{};
    for (const name in row) {
      const column = row[name];
      const extra = {
        formats: Object.freeze(column.formats),
        validations: Object.freeze(column.validations)
      };
      if (column.type === Types.Column.Real) {
        newer[name] = Object.freeze({
          ...column,
          ...extra,
          values: Object.freeze((<Columns.Real>column).values)
        });
      } else {
        newer[name] = Object.freeze({
          ...column,
          ...extra,
          fields: Object.freeze((<Columns.Virtual>column).fields)
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
  @Class.Private()
  private static assignToStorage(model: Types.ModelClass, properties?: Types.Entity): Types.Storage {
    let storage = this.storages.get(model);
    if (storage !== void 0) {
      Object.assign(storage, properties);
    } else {
      this.storages.set(
        model,
        (storage = {
          name: model.name,
          ...properties,
          real: {},
          virtual: {}
        })
      );
    }
    return storage;
  }

  /**
   * Find in all storages that corresponds to the specified model type using the given callback.
   * @param model Model type.
   * @param callback Callback filter.
   * @returns Returns the found value or undefined when no value was found.
   */
  @Class.Private()
  private static findInStorages<T>(model: Types.ModelClass, callback: (storage: Types.Storage) => T): T | undefined {
    const last = Reflect.getPrototypeOf(Function);
    let type = model.prototype.constructor;
    while ((model = <any>Reflect.getPrototypeOf(type)) !== last) {
      if (this.storages.has(type)) {
        const result = callback(this.storages.get(type)!);
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
  @Class.Private()
  private static assignToColumn(
    model: Types.ModelClass,
    type: Types.Column,
    name: string,
    properties?: Types.Entity
  ): Columns.Base {
    const storage = this.assignToStorage(model);
    const row = storage[type];
    if (type === Types.Column.Real && name in storage.virtual) {
      throw new Error(`A virtual column named '${name}' already exists.`);
    } else if (type === Types.Column.Virtual && name in storage.real) {
      throw new Error(`A real column named '${name}' already exists.`);
    } else if (name in row) {
      Object.assign(row[name], properties);
    } else {
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
  @Class.Private()
  private static assignToRVColumn(
    model: Types.ModelClass,
    name: string,
    properties?: Types.Entity
  ): Columns.Real | Columns.Virtual {
    const storage = this.assignToStorage(model);
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
   * Determines whether or not the specified model input is a valid entity model.
   * @param input Model input.
   * @returns Returns true when it's valid, false otherwise.
   */
  @Class.Public()
  public static isEntity<E extends Types.Entity>(input?: Types.ModelInput<E>): boolean {
    if (input) {
      const model = Helper.tryEntityModel(input);
      if (model !== void 0) {
        return this.storages.has(model.prototype.constructor);
      }
    }
    return false;
  }

  /**
   * Try to get the merged real and virtual row schema from the specified model type and fields.
   * @param model Model type.
   * @param fields Fields to be selected.
   * @returns Returns the real and virtual row schema or undefined when the model is invalid.
   */
  @Class.Public()
  public static tryRows(model: Types.ModelClass, ...fields: string[]): Columns.ReadonlyRow<Columns.Any> | undefined {
    const rows = <Columns.ReadonlyRow<Columns.Any>>{};
    let last;
    this.findInStorages(model, storage => {
      last = storage;
      const allRows = { ...storage.real, ...storage.virtual };
      for (const name in allRows) {
        const column = allRows[name];
        if (Columns.Helper.isVisible(column, ...fields) && !(name in rows)) {
          rows[name] = column;
        }
      }
    });
    if (last !== void 0) {
      return rows;
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
  @Class.Public()
  public static getRows(model: Types.ModelClass, ...fields: string[]): Columns.ReadonlyRow<Columns.Any> {
    const rows = this.tryRows(model, ...fields);
    if (rows === void 0) {
      throw new Error(`Invalid model type, unable to get rows.`);
    }
    return rows;
  }

  /**
   * Try to get the real row schema from the specified model type and fields.
   * @param model Model type.
   * @param fields Fields to be selected.
   * @returns Returns the real row schema or undefined when the model is invalid.
   */
  @Class.Public()
  public static tryRealRow(model: Types.ModelClass, ...fields: string[]): Columns.ReadonlyRow<Columns.Real> | undefined {
    const row = <Columns.ReadonlyRow<Columns.Real>>{};
    let last;
    this.findInStorages(model, storage => {
      last = storage;
      for (const name in storage.real) {
        const column = storage.real[name];
        if (Columns.Helper.isVisible(column, ...fields) && !(name in row)) {
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
  @Class.Public()
  public static getRealRow(model: Types.ModelClass, ...fields: string[]): Columns.ReadonlyRow<Columns.Real> {
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
  @Class.Public()
  public static tryVirtualRow(
    model: Types.ModelClass,
    ...fields: string[]
  ): Columns.ReadonlyRow<Columns.Virtual> | undefined {
    const row = <Columns.ReadonlyRow<Columns.Virtual>>{};
    let last;
    this.findInStorages(model, storage => {
      last = storage;
      for (const name in storage.virtual) {
        const column = storage.virtual[name];
        if (!(name in row) && Columns.Helper.isVisible(column, ...fields)) {
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
  @Class.Public()
  public static getVirtualRow(model: Types.ModelClass, ...fields: string[]): Columns.ReadonlyRow<Columns.Virtual> {
    const row = this.tryVirtualRow(model, ...fields);
    if (!row) {
      throw new Error(`Invalid model type, unable to get the virtual row.`);
    }
    return row;
  }

  /**
   * Try to get the real or virtual column schema from the specified model type and column name.
   * @param model Model type.
   * @param name Column name.
   * @returns Returns the real or virtual column schema or undefined when the column doesn't found.
   */
  @Class.Public()
  public static tryColumn<E extends Types.Entity>(
    model: Types.ModelClass<E>,
    name: string
  ): Readonly<Columns.Any<E>> | undefined {
    return this.findInStorages(model, storage => {
      if (name in storage.real) {
        return <Columns.Real<E>>storage.real[name];
      } else if (name in storage.virtual) {
        return <Columns.Virtual<E>>storage.virtual[name];
      }
    });
  }

  /**
   * Gets the real or virtual column schema from the specified model type and column name.
   * @param model Model type.
   * @param name Column name.
   * @returns Returns the real or virtual column schema.
   * @throws Throws an error when the model type isn't valid or the specified column was not found.
   */
  @Class.Public()
  public static getColumn<E extends Types.Entity>(model: Types.ModelClass<E>, name: string): Readonly<Columns.Any<E>> {
    const column = this.tryColumn(model, name);
    if (!column) {
      throw new Error(`Column '${name}' doesn't exists in the entity '${this.getStorageName(model)}'.`);
    }
    return column;
  }

  /**
   * Try to get the real column schema from the specified model type and column name.
   * @param model Model type.
   * @param name Column name.
   * @returns Returns the real column schema or undefined when the column doesn't found.
   */
  @Class.Public()
  public static tryRealColumn<E extends Types.Entity>(
    model: Types.ModelClass<E>,
    name: string
  ): Readonly<Columns.Real<E>> | undefined {
    return this.findInStorages(model, storage => {
      if (name in storage.real) {
        return <Columns.Real<E>>storage.real[name];
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
  @Class.Public()
  public static getRealColumn<E extends Types.Entity>(model: Types.ModelClass<E>, name: string): Readonly<Columns.Real<E>> {
    const column = this.tryRealColumn(model, name);
    if (!column) {
      throw new Error(`Real column '${name}' doesn't exists in the entity '${this.getStorageName(model)}'.`);
    }
    return column;
  }

  /**
   * Try to get the virtual column schema from the specified model type and column name.
   * @param model Model type.
   * @param name Column name.
   * @returns Returns the virtual column schema or undefined when the column doesn't found.
   */
  @Class.Public()
  public static tryVirtualColumn<E extends Types.Entity>(
    model: Types.ModelClass<E>,
    name: string
  ): Readonly<Columns.Virtual<E>> | undefined {
    return this.findInStorages(model, storage => {
      if (name in storage.virtual) {
        return <Columns.Virtual<E>>storage.virtual[name];
      }
    });
  }

  /**
   * Gets the virtual column schema from the specified model type and column name.
   * @param model Model type.
   * @param name Column name.
   * @returns Returns the virtual column schema.
   * @throws Throws an error when the model type isn't valid or the specified column was not found.
   */
  @Class.Public()
  public static getVirtualColumn<E extends Types.Entity>(
    model: Types.ModelClass<E>,
    name: string
  ): Readonly<Columns.Virtual<E>> {
    const column = this.tryVirtualColumn(model, name);
    if (!column) {
      throw new Error(`Virtual column '${name}' doesn't exists in the entity '${this.getStorageName(model)}'.`);
    }
    return column;
  }

  /**
   * Try to get the primary column schema from the specified model type.
   * @param model Model type.
   * @returns Returns the column schema or undefined when the column does not exists.
   */
  @Class.Public()
  public static tryPrimaryColumn<E extends Types.Entity>(model: Types.ModelClass<E>): Readonly<Columns.Real<E>> | undefined {
    return this.findInStorages(model, storage => {
      if (storage.primary) {
        return <Columns.Real<E>>storage.real[storage.primary];
      }
    });
  }

  /**
   * Gets the primary column schema from the specified model type.
   * @param model Model type.
   * @returns Returns the column schema.
   * @throws Throws an error when the entity model isn't valid or the primary column was not defined
   */
  @Class.Public()
  public static getPrimaryColumn<E extends Types.Entity>(model: Types.ModelClass<E>): Readonly<Columns.Real<E>> {
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
  @Class.Public()
  public static getStorageName(model: Types.ModelClass): string {
    const type = model.prototype.constructor;
    const storage = this.storages.get(type);
    if (!storage) {
      throw Error(`Invalid model type '${type.name}', unable to get the storage name.`);
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
  @Class.Public()
  public static Alias(name: string): Types.ModelDecorator {
    return (target, property) => {
      this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
        alias: name
      });
    };
  }

  /**
   * Decorates the specified property to convert its input and output value.
   * @param callback Caster callback.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Convert(callback: Types.ModelCaster): Types.ModelDecorator {
    return (target, property) => {
      this.assignToRVColumn(<Types.ModelClass>target.constructor, String(property), {
        caster: callback
      });
    };
  }

  /**
   * Decorates the specified property to be a required column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Required(): Types.ModelDecorator {
    return (target, property) => {
      const column = this.assignToRVColumn(<Types.ModelClass>target.constructor, String(property), {
        required: true
      });
      const index = column.validations.findIndex(validator => validator instanceof Formats.Undefined);
      if (index !== -1) {
        column.validations.splice(index, 1);
      }
    };
  }

  /**
   * Decorates the specified property to be a hidden column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Hidden(): Types.ModelDecorator {
    return (target, property) => {
      this.assignToRVColumn(<Types.ModelClass>target.constructor, String(property), {
        hidden: true
      });
    };
  }

  /**
   * Decorates the specified property to be a read-only column.
   * @returns Returns the decorator method.
   * @throws Throws an error when the column is already write-only.
   */
  @Class.Public()
  public static ReadOnly(): Types.ModelDecorator {
    return (target, property) => {
      const column = this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
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
  @Class.Public()
  public static WriteOnly(): Types.ModelDecorator {
    return (target, property) => {
      const column = this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
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
  @Class.Public()
  public static Join(
    foreign: string,
    model: Types.ModelInput,
    local: string,
    match?: Filters.Match,
    fields?: string[]
  ): Types.ModelDecorator {
    return (target, property, descriptor?) => {
      const schema = this.getRealColumn(<Types.ModelClass>target.constructor, local);
      const multiple = schema.formats.includes(Types.Format.Array);
      return this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Virtual, String(property), {
          local: Columns.Helper.getName(schema),
          foreign: foreign,
          multiple: multiple,
          fields: fields,
          model: model,
          query: {
            pre: match
          }
        }),
        multiple ? new Formats.ArrayOf(model) : new Formats.InstanceOf(model),
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
   * @param fields Fields to be selected.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static JoinAll(
    foreign: string,
    model: Types.ModelInput,
    local: string,
    query?: Filters.Query,
    fields?: string[]
  ): Types.ModelDecorator {
    return (target, property, descriptor?) => {
      const schema = this.getRealColumn(<Types.ModelClass>target.constructor, local);
      const multiple = schema.formats.includes(Types.Format.Array);
      return this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Virtual, String(property), {
          local: Columns.Helper.getName(schema),
          foreign: foreign,
          multiple: multiple,
          fields: fields,
          model: model,
          query: query,
          all: true
        }),
        new Formats.InstanceOf(Array),
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
  public static Primary(): Types.ModelDecorator {
    return (target, property) => {
      this.assignToStorage(<Types.ModelClass>target.constructor, {
        primary: String(property)
      });
    };
  }

  /**
   * Decorates the specified property to be an Id column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Id(): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property)),
        new Formats.Any(),
        Types.Format.Id,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a column that accepts null values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Null(): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property)),
        new Formats.Null(),
        Types.Format.Null,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a binary column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Binary(): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property)),
        new Formats.Any(),
        Types.Format.Binary,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a boolean column.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Boolean(): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property)),
        new Formats.Boolean(),
        Types.Format.Boolean,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be an integer column.
   * @param minimum Minimum value.
   * @param maximum Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Integer(minimum?: number, maximum?: number): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          minimum: minimum,
          maximum: maximum
        }),
        new Formats.Integer(minimum, maximum),
        Types.Format.Integer,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a decimal column.
   * @param minimum Minimum value.
   * @param maximum Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Decimal(minimum?: number, maximum?: number): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          minimum: minimum,
          maximum: maximum
        }),
        new Formats.Decimal(minimum, maximum),
        Types.Format.Decimal,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a number column.
   * @param minimum Minimum value.
   * @param maximum Maximum value.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Number(minimum?: number, maximum?: number): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          minimum: minimum,
          maximum: maximum
        }),
        new Formats.Number(minimum, maximum),
        Types.Format.Number,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a string column.
   * @param minimum Minimum length.
   * @param maximum Maximum length.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static String(minimum?: number, maximum?: number): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          minimum: minimum,
          maximum: maximum
        }),
        new Formats.String(minimum, maximum),
        Types.Format.String,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be an enumeration column.
   * @param values Enumeration values.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Enumeration(values: Types.ModelValues): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          values: values
        }),
        new Formats.Enumeration(values),
        Types.Format.Enumeration,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a string pattern column.
   * @param pattern Pattern expression.
   * @param name Pattern name.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Pattern(pattern: RegExp, name?: string): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          pattern: pattern
        }),
        new Formats.Pattern(pattern, name),
        Types.Format.Pattern,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a timestamp column.
   * @param minimum Minimum date.
   * @param maximum Maximum date.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Timestamp(minimum?: Date, maximum?: Date): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          caster: Castings.ISODate.Integer.bind(Castings.ISODate)
        }),
        new Formats.Integer(minimum ? minimum.getTime() : 0, maximum ? maximum.getTime() : Infinity),
        Types.Format.Timestamp,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a date column.
   * @param minimum Minimum date.
   * @param maximum Maximum date.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Date(minimum?: Date, maximum?: Date): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          caster: Castings.ISODate.Object.bind(Castings.ISODate)
        }),
        new Formats.Timestamp(minimum, maximum),
        Types.Format.Date,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be an array column.
   * @param model Model type.
   * @param fields Fields to select.
   * @param unique Determines whether or not the array items must be unique.
   * @param minimum Minimum items.
   * @param maximum Maximum items.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Array(
    model: Types.ModelInput,
    fields?: string[],
    unique?: boolean,
    minimum?: number,
    maximum?: number
  ): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          model: model,
          fields: fields,
          unique: unique,
          minimum: minimum,
          maximum: maximum
        }),
        new Formats.ArrayOf(model),
        Types.Format.Array,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be a map column.
   * @param model Model type.
   * @param fields Fields to select.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Map(model: Types.ModelInput, fields?: string[]): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          model: model,
          fields: fields
        }),
        new Formats.MapOf(model),
        Types.Format.Map,
        descriptor
      );
  }

  /**
   * Decorates the specified property to be an object column.
   * @param model Model type.
   * @param fields Fields to select.
   * @returns Returns the decorator method.
   */
  @Class.Public()
  public static Object(model: Types.ModelInput, fields?: string[]): Types.ModelDecorator {
    return (target, property, descriptor?) =>
      this.setValidation(
        target,
        this.assignToColumn(<Types.ModelClass>target.constructor, Types.Column.Real, String(property), {
          model: model,
          fields: fields
        }),
        new Formats.InstanceOf(model),
        Types.Format.Object,
        descriptor
      );
  }
}
