/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from '../types';
import * as Columns from '../columns';

import { Helper } from '../helper';
import { Schema } from '../schema';

/**
 * Inputer helper class.
 */
@Class.Describe()
export class Inputer extends Class.Null {
  /**
   * Creates a new list based on the specified model type and entry list.
   * @param model Model type.
   * @param entries Entry list.
   * @param required Determines whether all required columns must be provided.
   * @param multiple Determines whether each value in the specified list can be a sub list.
   * @returns Returns the generated list.
   */
  @Class.Private()
  private static createArrayEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entries: (I | I[])[],
    required: boolean,
    multiple: boolean
  ): (O | O[])[] {
    const list = [];
    for (const entry of entries) {
      if (multiple && entry instanceof Array) {
        list.push(<O[]>this.createArrayEntity(model, entry, required, false));
      } else {
        list.push(this.createEntity(model, entry, required));
      }
    }
    return list;
  }

  /**
   * Create a new map based on the specified model type and entry map.
   * @param model Model type.
   * @param entry Entry map.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the generated map.
   */
  @Class.Private()
  private static createMapEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: Types.Map<I>,
    required: boolean
  ): Types.Map<O> {
    const map = <Types.Map<O>>{};
    for (const property in entry) {
      const entity = entry[property];
      if (entity !== void 0) {
        map[property] = this.createEntity(model, entity, required);
      }
    }
    return map;
  }

  /**
   * Creates a new entity value from the specified column schema and entry value.
   * @param model Model type.
   * @param schema Column schema.
   * @param entry Entry value.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the entity value.
   * @throws Throws an error when the expected value should be an array or map but the given value is not.
   */
  @Class.Private()
  private static createValue<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    schema: Columns.Base<O>,
    entry: I | Types.Map<I> | (I | I[])[],
    required: boolean
  ): O | I | Types.Map<O | I> | ((O | I) | (O | I)[])[] {
    if (schema.model && Schema.isEntity(schema.model)) {
      if (entry instanceof Array) {
        if (schema.formats.includes(Types.Format.Array)) {
          const nestedMultiple = (<Columns.Virtual<O>>schema).all || false;
          return this.createArrayEntity(Helper.getEntityModel(schema.model), entry, required, nestedMultiple);
        } else {
          throw new Error(`Input column '${schema.name}@${Schema.getStorageName(model)}' doesn't support array types.`);
        }
      } else if (entry instanceof Object) {
        if (schema.formats.includes(Types.Format.Object)) {
          return this.createEntity(Helper.getEntityModel(schema.model), entry, required);
        } else if (schema.formats.includes(Types.Format.Map)) {
          return this.createMapEntity(Helper.getEntityModel(schema.model), entry, required);
        } else {
          throw new Error(`Input column '${schema.name}@${Schema.getStorageName(model)}' doesn't support object types.`);
        }
      }
    }
    return schema.caster(entry, Types.Cast.Input);
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
  private static createEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: I,
    required: boolean
  ): O {
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
        const result = this.createValue(model, schema, value, required);
        if (result !== void 0) {
          entity[<keyof O>name] = result;
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
  public static create<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entry: I): O {
    return this.createEntity(model, entry, false);
  }

  /**
   * Creates a new entity array based on the specified model type and entry list.
   * @param model Model type.
   * @param entries Entry list.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createArray<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, entries: I[]): O[] {
    return <O[]>this.createArrayEntity(model, entries, false, false);
  }

  /**
   * Create a new entity map based on the specified model type and entry map.
   * @param model Model type.
   * @param entry Entry map.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: Types.Map<I>
  ): Types.Map<O> {
    return this.createMapEntity(model, entry, false);
  }

  /**
   * Creates a new full entity based on the specified model type and entry value.
   * @param model Model type.
   * @param entry Entry value.
   * @returns Returns the generated entity.
   */
  @Class.Public()
  public static createFull<I extends Types.Entity, O extends Types.Entity>(model: Types.ModelClass<O>, data: I): O {
    return this.createEntity(model, data, true);
  }

  /**
   * Creates a new full entity array based on the specified model type and entry list.
   * @param model Model type.
   * @param entries Entry list.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createFullArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entries: I[]
  ): O[] {
    return <O[]>this.createArrayEntity(model, entries, true, false);
  }

  /**
   * Create a new full entity map based on the specified model type and entry map.
   * @param model Model type.
   * @param entry Entry map.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createFullMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: Types.Map<I>
  ): Types.Map<O> {
    return this.createMapEntity(model, entry, true);
  }
}
