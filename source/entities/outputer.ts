/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from '../types';
import * as Columns from '../columns';

import { Schema } from '../schema';

/**
 * Outputer helper class.
 */
@Class.Describe()
export class Outputer extends Class.Null {
  /**
   * Creates a new list based on the specified model type, entry list and viewed fields.
   * @param model Model type.
   * @param entries Entry list.
   * @param multiple Determines whether each value in the specified list can be a sub list.
   * @param required Determines whether all required columns must be provided.
   * @param fields Viewed fields.
   * @returns Returns the generated list.
   */
  @Class.Private()
  private static createArrayEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entries: (I | I[])[],
    multiple: boolean,
    required: boolean,
    fields: string[]
  ): (O | O[])[] {
    const list = [];
    for (const entry of entries) {
      let entity;
      if (multiple && entry instanceof Array) {
        entity = this.createArrayEntity(model, entry, false, required, fields);
      } else {
        entity = this.createEntity(model, entry, fields, required, false);
      }
      if (entity !== void 0) {
        list.push(entity);
      }
    }
    return <(O | O[])[]>list;
  }

  /**
   * Create a new entity map based on the specified model type, entry map and viewed fields.
   * @param model Model type.
   * @param entry Entry map.
   * @param fields Viewed fields.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the generated entity map.
   */
  @Class.Private()
  private static createMapEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: Types.Map<I>,
    fields: string[],
    required: boolean
  ): Types.Map<O> {
    const map = <Types.Map<O>>{};
    for (const property in entry) {
      const entity = <O>this.createEntity(model, entry[property], fields, required, false);
      if (entity !== void 0) {
        map[property] = entity;
      }
    }
    return map;
  }

  /**
   * Creates a new entry value from the specified column schema, entity value and viewed fields.
   * @param model Model type.
   * @param schema Column schema.
   * @param entry Entry value.
   * @param fields Viewed fields.
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the original or the converted value.
   * @throws Throws an error when the expected value should be an array or map but the given value is not.
   */
  @Class.Private()
  private static createValue<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    schema: Columns.Base<O>,
    entry: I | Types.Map<I> | (I | I[])[],
    fields: string[],
    required: boolean
  ): O | I | Types.Map<O | I> | ((O | I) | (O | I)[])[] | undefined {
    if (schema.model && Schema.isEntity(schema.model)) {
      if (entry instanceof Array) {
        if (schema.formats.includes(Types.Format.Array)) {
          return this.createArrayEntity(
            Schema.getEntityModel(schema.model),
            entry,
            (<Columns.Virtual<O>>schema).all || false,
            required,
            fields
          );
        } else {
          throw new TypeError(`Output column '${schema.name}@${Schema.getStorageName(model)}' doesn't support array types.`);
        }
      } else if (entry instanceof Object) {
        if (schema.formats.includes(Types.Format.Object)) {
          return this.createEntity(
            Schema.getEntityModel(schema.model),
            entry,
            fields,
            required,
            (schema.required || false) && schema.type === Types.Column.Real
          );
        } else if (schema.formats.includes(Types.Format.Map)) {
          return this.createMapEntity(Schema.getEntityModel(schema.model), entry, fields, required);
        } else {
          throw new TypeError(
            `Output column '${schema.name}@${Schema.getStorageName(model)}' doesn't support object types.`
          );
        }
      }
    }
    return schema.caster(entry, Types.Cast.Output);
  }

  /**
   * Creates a new entity based on the specified model type, entry value and viewed fields.
   * @param model Model type.
   * @param entry Entry value.
   * @param fields Viewed fields.
   * @param required Determines whether all required columns must be provided.
   * @param wanted Determines whether all columns are wanted by the parent entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when required columns aren't supplied or write-only columns were set.
   */
  @Class.Private()
  private static createEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: I,
    fields: string[],
    required: boolean,
    wanted: boolean
  ): O | undefined {
    const columns = { ...Schema.getRealRow(model, ...fields), ...Schema.getVirtualRow(model, ...fields) };
    const entity = <O>new model();
    const missing = [];
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
        const result = this.createValue(model, schema, value, fields, required);
        if (result !== void 0) {
          entity[<keyof O>name] = result;
        }
      }
    }
    if (!wanted && Schema.isEmpty(model, entity, 0)) {
      return void 0;
    }
    if (missing.length) {
      throw new Error(`Output column '[${missing.join(',')}]@${Schema.getStorageName(model)}' wasn't given.`);
    }
    return entity;
  }

  /**
   * Creates a new entity based on the specified model type, entry value and viewed fields.
   * @param model Model type.
   * @param entry Entry value.
   * @param fields Viewed fields.
   * @returns Returns the generated entity or undefined when the entity has no data.
   */
  @Class.Public()
  public static create<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: I,
    fields: string[]
  ): O | undefined {
    return this.createEntity(model, entry, fields, false, true);
  }

  /**
   * Creates a new entity array based on the specified model type, entry list and viewed fields.
   * @param model Model type.
   * @param entries Entry list.
   * @param fields Viewed fields.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entries: I[],
    fields: string[]
  ): O[] {
    return <O[]>this.createArrayEntity(model, entries, false, false, fields);
  }

  /**
   * Create a new entity map based on the specified model type, entry map and viewed fields.
   * @param model Model type.
   * @param entry Entry map.
   * @param fields Viewed fields.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: Types.Map<I>,
    fields: string[]
  ): Types.Map<O> {
    return this.createMapEntity(model, entry, fields, false);
  }

  /**
   * Creates a new full entity based on the specified model type, entry value and viewed fields.
   * @param model Model type.
   * @param entry Entry value.
   * @param fields Viewed fields.
   * @returns Returns the generated entity or undefined when the entity has no data.
   */
  @Class.Public()
  public static createFull<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: I,
    fields: string[]
  ): O | undefined {
    return this.createEntity(model, entry, fields, true, true);
  }

  /**
   * Creates a new full entity array based on the specified model type, entry list and viewed fields.
   * @param model Model type.
   * @param entries Entry list.
   * @param fields Viewed fields.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createFullArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entries: I[],
    fields: string[]
  ): O[] {
    return <O[]>this.createArrayEntity(model, entries, false, true, fields);
  }

  /**
   * Create a new full entity map based on the specified model type, entry map and viewed fields.
   * @param model Model type.
   * @param entry Entry map.
   * @param fields Viewed fields.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createFullMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.ModelClass<O>,
    entry: Types.Map<I>,
    fields: string[]
  ): Types.Map<O> {
    return this.createMapEntity(model, entry, fields, true);
  }
}
