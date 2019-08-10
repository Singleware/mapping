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
 * Normalizer helper class.
 */
@Class.Describe()
export class Normalizer extends Class.Null {
  /**
   * Creates a new normalized entry array based on the specified model type and entity list.
   * @param model Model type.
   * @param entities Entity list.
   * @param multiple Determines whether each value in the specified list is a sub list.
   * @param aliased Determines whether all column names should be aliased.
   * @param unsafe Determines whether all hidden columns should be visible.
   * @returns Returns the generated entry array.
   */
  @Class.Private()
  private static createArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<I>,
    entities: Arrays<I>,
    multiple: boolean,
    aliased: boolean,
    unsafe: boolean
  ): Arrays<O> {
    const data = [];
    for (const entity of entities) {
      if (multiple && entity instanceof Array) {
        data.push(this.createArray(model, entity, false, aliased, unsafe));
      } else {
        data.push(this.create(model, entity, aliased, unsafe));
      }
    }
    return data;
  }

  /**
   * Creates a new normalized entry map based on the specified model type and entity map.
   * @param model Model type.
   * @param entity Entity map.
   * @param aliased Determines whether all column names should be aliased.
   * @param unsafe Determines whether all hidden columns should be visible.
   * @returns Returns the generated entry map.
   */
  @Class.Private()
  private static createMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<I>,
    entity: Types.Map<I>,
    aliased: boolean,
    unsafe: boolean
  ): Types.Map<O> {
    const data = <Types.Map<O>>{};
    for (const property in entity) {
      data[property] = this.create(model, entity[property], aliased, unsafe);
    }
    return data;
  }

  /**
   * Creates a new normalized entry from the specified column schema and entity value.
   * @param model Model type.
   * @param schema Column schema.
   * @param entity Entity value.
   * @param aliased Determines whether all column names should be aliased.
   * @param unsafe Determines whether all hidden columns should be visible.
   * @returns Returns the normalized entry or the provided entity value.
   */
  @Class.Private()
  private static createValue<I extends Types.Entity, O extends Types.Entity, G>(
    model: Types.Model<I>,
    schema: Columns.Base<I>,
    entity: Values<G, I>,
    aliased: boolean,
    unsafe: boolean
  ): Values<G, O> {
    if (!schema.model || !Schema.isEntity(schema.model) || (entity === null && schema.formats.includes(Types.Format.Null))) {
      return <G>entity;
    }
    if (schema.formats.includes(Types.Format.Array)) {
      if (!(entity instanceof Array)) {
        throw new TypeError(`Column '${schema.name}@${Schema.getStorageName(model)}' must be an array.`);
      }
      return this.createArray(schema.model, entity, <boolean>(<Columns.Virtual<I>>schema).all, aliased, unsafe);
    }
    if (schema.formats.includes(Types.Format.Map)) {
      if (!(entity instanceof Object)) {
        throw new TypeError(`Column '${schema.name}@${Schema.getStorageName(model)}' must be a map.`);
      }
      return this.createMap(schema.model, entity, aliased, unsafe);
    }
    return this.create(schema.model, entity, aliased, unsafe);
  }

  /**
   * Creates a new normalized entry based on the specified model type and entity value.
   * @param model Model type.
   * @param entity Entity value.
   * @param aliased Determines whether all column names should be aliased.
   * @param unsafe Determines whether all hidden columns should be visible.
   * @returns Returns the generated entry.
   */
  @Class.Public()
  public static create<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<I>,
    entity: I,
    aliased: boolean,
    unsafe: boolean
  ): O {
    const columns = { ...Schema.getRealRow(model), ...Schema.getVirtualRow(model) };
    const data = <O>{};
    for (const name in columns) {
      const schema = columns[name];
      if (unsafe || !schema.hidden) {
        const value = entity[name];
        if (value !== void 0) {
          const input = this.createValue(model, schema, schema.caster(value, Types.Cast.Normalize), aliased, unsafe);
          if (input !== void 0) {
            data[<keyof O>(aliased ? Schema.getColumnName(schema) : schema.name)] = input;
          }
        }
      }
    }
    return data;
  }
}
