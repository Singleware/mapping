/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from '../types';
import * as Columns from '../columns';

import { Schema } from '../schema';

/**
 * Array values alias.
 */
type Arrays<T> = (T | T[])[];

/**
 * Generic values alias.
 */
type Values<G, T> = G | T | Arrays<T> | Types.Map<T>;

/**
 * Outputer helper class.
 */
@Class.Describe()
export class Outputer extends Class.Null {
  /**
   * Determines whether the specified value is an empty result or not.
   * @param value Value to check.
   * @returns Returns true when the specified value is empty, false otherwise.
   */
  @Class.Private()
  private static isEmptyResult<E extends Types.Entity, T>(value: T[] | Types.Model<E>): boolean {
    if (value instanceof Array) {
      return value.length === 0;
    } else if (value instanceof Object) {
      return !Schema.isEntity(<Types.Model<E>>value) && Object.keys(value).length === 0;
    }
    return false;
  }

  /**
   * Creates a new entity array based on the specified model type, viewed fields and entry list.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entries Entry list.
   * @param required Determines whether all required columns must be provided.
   * @param multiple Determines whether each value from the specified list is another list.
   * @returns Returns the generated entity array.
   */
  @Class.Private()
  private static createArrayEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    entries: Arrays<I>,
    required: boolean,
    multiple: boolean
  ): Arrays<O> {
    const entities = [];
    for (const entry of entries) {
      let entity;
      if (multiple && entry instanceof Array) {
        entity = <O[]>this.createArrayEntity(model, fields, entry, required, false);
      } else {
        entity = this.createEntity(model, fields, entry, required, false);
      }
      if (entity !== void 0) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /**
   * Create a new entity map based on the specified model type, viewed fields and entry map.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entry Entry map.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the generated entity map.
   */
  @Class.Private()
  private static createMapEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    entry: Types.Map<I>,
    required: boolean
  ): Types.Map<O> {
    const entities = <Types.Map<O>>{};
    for (const property in entry) {
      const entity = this.createEntity(model, fields, entry[property], required, false);
      if (entity !== void 0) {
        entities[property] = entity;
      }
    }
    return entities;
  }

  /**
   * Converts if possible the specified entry to an entity.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param schema Column schema.
   * @param entry Entry value.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the original or the converted value.
   * @throws Throws an error when the expected value should be an array or map but the given value is not.
   */
  @Class.Private()
  private static createValue<I extends Types.Entity, O extends Types.Entity, G>(
    model: Types.Model<O>,
    fields: string[],
    schema: Columns.Base<O>,
    entry: Values<G, I>,
    required: boolean
  ): Values<G, O> | undefined {
    if (!schema.model || !Schema.isEntity(schema.model) || (entry === null && schema.formats.includes(Types.Format.Null))) {
      return <G>entry;
    }
    if (schema.formats.includes(Types.Format.Array)) {
      if (!(entry instanceof Array)) {
        throw new TypeError(`Output column '${Schema.getColumnName(schema)}@${Schema.getStorageName(model)}' must be an array.`);
      }
      return this.createArrayEntity(schema.model, fields, entry, required, (<Columns.Virtual<O>>schema).all || false);
    }
    if (schema.formats.includes(Types.Format.Map)) {
      if (!(entry instanceof Object)) {
        throw new TypeError(`Output column '${Schema.getColumnName(schema)}@${Schema.getStorageName(model)}' must be a map.`);
      }
      return this.createMapEntity(schema.model, fields, entry, required);
    }
    return this.createEntity(schema.model, fields, entry, required, (schema.required || false) && schema.type === Types.Column.Real);
  }

  /**
   * Creates a new entity based on the specified model type, viewed fields and entry.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entry Entry value.
   * @param required Determines whether all required columns must be provided.
   * @param wanted Determines whether all columns are wanted by the parent entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when required columns aren't supplied or write-only columns were set.
   */
  @Class.Private()
  private static createEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    entry: I,
    required: boolean,
    wanted: boolean
  ): O | undefined {
    const columns = { ...Schema.getRealRow(model, ...fields), ...Schema.getVirtualRow(model, ...fields) };
    const entity = <O>new model();
    const missing = [];
    let filled = false;
    for (const name in columns) {
      const schema = columns[name];
      const value = entry[Schema.getColumnName(schema)];
      if (value === void 0) {
        if (required && schema.required && !schema.writeOnly) {
          missing.push(name);
        }
      } else {
        if (schema.writeOnly) {
          throw new Error(`Output column '${name}@${Schema.getStorageName(model)}' is write-only.`);
        }
        const output = this.createValue(model, fields, schema, schema.caster(value, Types.Cast.Output), required);
        if (output !== void 0 && (wanted || filled || !this.isEmptyResult(output))) {
          entity[<keyof O>name] = output;
          filled = true;
        }
      }
    }
    if (!filled && !wanted) {
      return void 0;
    }
    if (missing.length) {
      throw new Error(`Output column '[${missing.join(',')}]@${Schema.getStorageName(model)}' wasn't given.`);
    }
    return entity;
  }

  /**
   * Creates a new entity based on the specified model type, viewed fields and entry value.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entry Entry value.
   * @returns Returns the generated entity or undefined when the entity has no data.
   */
  @Class.Public()
  public static create<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, fields: string[], entry: I): O | undefined {
    return this.createEntity(model, fields, entry, false, true);
  }

  /**
   * Creates a new entity array based on the specified model type, viewed fields and entry list.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entries Entry list.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    entries: Arrays<I>
  ): Arrays<O> {
    return this.createArrayEntity(model, fields, entries, false, false);
  }

  /**
   * Create a new entity map based on the specified model type, viewed fields and entry map.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entry Entry map.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    entry: Types.Map<I>
  ): Types.Map<O> {
    return this.createMapEntity(model, fields, entry, false);
  }

  /**
   * Creates a new full entity based on the specified model type, viewed fields and entry value.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entry Entry value.
   * @returns Returns the generated entity or undefined when the entity has no data.
   */
  @Class.Public()
  public static createFull<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    entry: I
  ): O | undefined {
    return this.createEntity(model, fields, entry, true, true);
  }

  /**
   * Creates a new full entity array based on the specified model type, viewed fields and entry list.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entries Entry list.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createFullArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    views: string[],
    entries: Arrays<I>
  ): Arrays<O> {
    return this.createArrayEntity(model, views, entries, true, false);
  }

  /**
   * Create a new full entity map based on the specified model type, viewed fields and entry map.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param entry Entry map.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createFullMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    map: Types.Map<I>
  ): Types.Map<O> {
    return this.createMapEntity(model, fields, map, true);
  }
}
