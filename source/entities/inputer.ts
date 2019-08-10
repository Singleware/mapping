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
 * Inputer helper class.
 */
@Class.Describe()
export class Inputer extends Class.Null {
  /**
   * Creates a new entity array based on the specified model type and entry list.
   * @param model Model type.
   * @param entries Entry list.
   * @param required Determines whether all required columns must be provided.
   * @param multiple Determines whether each value from the specified list is another list.
   * @returns Returns the generated entity array.
   */
  @Class.Private()
  private static createArrayEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    entries: Arrays<I>,
    required: boolean,
    multiple: boolean
  ): Arrays<O> {
    const entities = [];
    for (const entry of entries) {
      let entity;
      if (multiple && entry instanceof Array) {
        entity = <O[]>this.createArrayEntity(model, entry, required, false);
      } else {
        entity = this.createEntity(model, entry, required);
      }
      if (entity !== void 0) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /**
   * Create a new entity map based on the specified model type and entry map.
   * @param model Model type.
   * @param entry Entry map.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the generated map of entities.
   */
  @Class.Private()
  private static createMapEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    entry: Types.Map<I>,
    required: boolean
  ): Types.Map<O> {
    const entities = <Types.Map<O>>{};
    for (const property in entry) {
      const entity = this.createEntity(model, entry[property], required);
      if (entity !== void 0) {
        entities[property] = entity;
      }
    }
    return entities;
  }

  /**
   * Converts if possible the specified entry to an entity.
   * @param model Model type.
   * @param schema Column schema.
   * @param entry Entry value.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the original or the converted value.
   * @throws Throws an error when the expected value should be an array or map but the given value is not.
   */
  @Class.Private()
  private static createValue<I extends Types.Entity, O extends Types.Entity, G>(
    model: Types.Model<O>,
    schema: Columns.Base<O>,
    entry: Values<G, I>,
    required: boolean
  ): Values<G, O> | undefined {
    if (!schema.model || !Schema.isEntity(schema.model) || (entry === null && schema.formats.includes(Types.Format.Null))) {
      return <G>entry;
    }
    if (schema.formats.includes(Types.Format.Array)) {
      if (!(entry instanceof Array)) {
        throw new TypeError(`Input column '${schema.name}@${Schema.getStorageName(model)}' must be an array.`);
      }
      return this.createArrayEntity(schema.model, entry, required, <boolean>(<Columns.Virtual<O>>schema).all);
    }
    if (schema.formats.includes(Types.Format.Map)) {
      if (!(entry instanceof Object)) {
        throw new TypeError(`Input column '${schema.name}@${Schema.getStorageName(model)}' must be a map.`);
      }
      return this.createMapEntity(schema.model, entry, required);
    }
    return this.createEntity(schema.model, entry, required);
  }

  /**
   * Creates a new entity based on the specified model type and entry.
   * @param model Model type.
   * @param entry Entry value.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the generated entity.
   * @throws Throws an error when required columns aren't supplied or read-only columns were set.
   */
  @Class.Private()
  private static createEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, entry: I, required: boolean): O {
    const entity = <O>new model();
    const columns = Schema.getRealRow(model);
    for (const name in columns) {
      const schema = columns[name];
      const value = entry[schema.name];
      if (value === void 0) {
        if (required && schema.required && !schema.readOnly) {
          throw new Error(`Input column '${name}@${Schema.getStorageName(model)}' wasn't given.`);
        }
      } else {
        if (schema.readOnly) {
          throw new Error(`Input column '${name}@${Schema.getStorageName(model)}' is read-only.`);
        }
        const input = this.createValue(model, schema, schema.caster(value, Types.Cast.Input), required);
        if (input !== void 0) {
          entity[<keyof O>name] = input;
        }
      }
    }
    return entity;
  }

  /**
   * Creates a new entity based on the specified model type and entry value.
   * @param model Model type.
   * @param entry Entry value.
   * @returns Returns the generated entity.
   */
  @Class.Public()
  public static create<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, entry: I): O {
    return this.createEntity(model, entry, false);
  }

  /**
   * Creates a new entity array based on the specified model type and entry list.
   * @param model Model type.
   * @param entries Entry list.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, entries: Arrays<I>): Arrays<O> {
    return this.createArrayEntity(model, entries, false, false);
  }

  /**
   * Create a new entity map based on the specified model type and entry map.
   * @param model Model type.
   * @param entry Entry map.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, entry: Types.Map<I>): Types.Map<O> {
    return this.createMapEntity(model, entry, false);
  }

  /**
   * Creates a new full entity based on the specified model type and entry value.
   * @param model Model type.
   * @param entry Entry value.
   * @returns Returns the generated entity.
   */
  @Class.Public()
  public static createFull<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, data: I): O {
    return this.createEntity(model, data, true);
  }

  /**
   * Creates a new full entity array based on the specified model type and entry list.
   * @param model Model type.
   * @param entries Entry list.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createFullArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, entries: Arrays<I>): Arrays<O> {
    return this.createArrayEntity(model, entries, true, false);
  }

  /**
   * Create a new full entity map based on the specified model type and entry map.
   * @param model Model type.
   * @param entry Entry map.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createFullMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, entry: Types.Map<I>): Types.Map<O> {
    return this.createMapEntity(model, entry, true);
  }
}
