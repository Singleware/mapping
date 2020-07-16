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
 * Outputer helper class.
 */
@Class.Describe()
export class Outputer extends Class.Null {
  /**
   * Creates a new list based on the specified model type, entry list and the fields.
   * @param model Model type.
   * @param entries Entry list.
   * @param fields Fields to be included in the entity.
   * @param required Determines whether all required columns must be provided.
   * @param wanted Determines whether all columns are wanted by the parent entity.
   * @param multiple Determines whether each value in the specified list can be a sub list.
   * @returns Returns the generated list.
   */
  @Class.Private()
  private static createArrayEntity<I extends Types.Entity, O>(
    model: Types.ModelClass<O>,
    entries: (I | I[])[],
    fields: string[],
    required: boolean,
    wanted: boolean,
    multiple: boolean
  ): (O | O[])[] {
    const list = [];
    for (const entry of entries) {
      let entity;
      if (multiple && entry instanceof Array) {
        entity = this.createArrayEntity(model, entry, fields, required, wanted, false);
      } else {
        entity = this.createEntity(model, entry, fields, required, wanted);
      }
      if (entity !== void 0) {
        list.push(entity);
      }
    }
    return <(O | O[])[]>list;
  }

  /**
   * Create a new entity map based on the specified model type, entry map and the fields.
   * @param model Model type.
   * @param entry Entry map.
   * @param fields Fields to be included in the entity.
   * @param required Determines whether all required columns must be provided.
   * @param wanted Determines whether all columns are wanted by the parent entity.
   * @returns Returns the generated entity map.
   */
  @Class.Private()
  private static createMapEntity<I extends Types.Entity, O>(
    model: Types.ModelClass<O>,
    entry: Types.Map<I>,
    fields: string[],
    required: boolean,
    wanted: boolean
  ): Types.Map<O> {
    const map = <Types.Map<O>>{};
    for (const property in entry) {
      const entity = <O>this.createEntity(model, entry[property], fields, required, wanted);
      if (entity !== void 0) {
        map[property] = entity;
      }
    }
    return map;
  }

  /**
   * Creates a new entry value from the specified column schema, entity value and the fields.
   * @param model Model type.
   * @param schema Column schema.
   * @param entry Entry value.
   * @param fields Fields to be included in the entity (if the values is an entity).
   * @param required Determines whether all required columns must be provided.
   * @returns Returns the original or the converted value.
   * @throws Throws an error when the expected value should be an array or map but the given value is not.
   */
  @Class.Private()
  private static createValue<I extends Types.Entity, O>(
    model: Types.ModelClass<O>,
    schema: Columns.Base<O>,
    entry: I | Types.Map<I> | (I | I[])[],
    fields: string[],
    required: boolean
  ): O | I | Types.Map<O | I> | ((O | I) | (O | I)[])[] | undefined {
    if (schema.model && Schema.isEntity(schema.model)) {
      const nestedFields = fields.length > 0 ? Columns.Helper.getNestedFields(schema, fields) : schema.fields || [];
      const nestedRequired = required && nestedFields.length === 0;
      const nestedModel = Helper.getEntityModel(schema.model);
      if (entry instanceof Array) {
        if (schema.formats.includes(Types.Format.Array)) {
          const nestedMultiple = (<Columns.Virtual<O>>schema).all || false;
          return this.createArrayEntity(nestedModel, entry, nestedFields, nestedRequired, false, nestedMultiple);
        } else {
          throw new Error(`Output column '${schema.name}@${Schema.getStorageName(model)}' doesn't support array types.`);
        }
      } else if (entry instanceof Object) {
        if (schema.formats.includes(Types.Format.Object)) {
          const nestedWanted = (schema.required || false) && schema.type === Types.Column.Real;
          return this.createEntity(nestedModel, entry, nestedFields, nestedRequired, nestedWanted);
        } else if (schema.formats.includes(Types.Format.Map)) {
          return this.createMapEntity(nestedModel, entry, nestedFields, nestedRequired, false);
        } else {
          throw new Error(`Output column '${schema.name}@${Schema.getStorageName(model)}' doesn't support object types.`);
        }
      }
    }
    return schema.caster(entry, Types.Cast.Output);
  }

  /**
   * Creates a new entity based on the specified model type, entry value and the fields.
   * @param model Model type.
   * @param entry Entry value.
   * @param fields Fields to be included in the entity.
   * @param required Determines whether all required columns must be provided.
   * @param wanted Determines whether all columns are wanted by the parent entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when required columns aren't supplied or write-only columns were set.
   */
  @Class.Private()
  private static createEntity<I extends Types.Entity, O>(
    model: Types.ModelClass<O>,
    entry: I,
    fields: string[],
    required: boolean,
    wanted: boolean
  ): O | undefined {
    const schemas = Schema.getRows(model, ...fields);
    const entity = <O>new model();
    const missing = [];
    for (const name in schemas) {
      const schema = schemas[name];
      const value = entry[Columns.Helper.getName(schema)];
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
    if (!wanted && Helper.isEmptyModel(model, entity, 0)) {
      return void 0;
    }
    if (missing.length) {
      throw new Error(`Output column '[${missing.join(',')}]@${Schema.getStorageName(model)}' wasn't given.`);
    }
    return entity;
  }

  /**
   * Creates a new entity based on the specified model type, entry value and the fields.
   * @param model Model type.
   * @param entry Entry value.
   * @param fields Fields to be included in the entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   */
  @Class.Public()
  public static create<I extends Types.Entity, O>(model: Types.ModelClass<O>, entry: I, fields: string[]): O | undefined {
    return this.createEntity(model, entry, fields, false, true);
  }

  /**
   * Creates a new entity array based on the specified model type, entry list and the fields.
   * @param model Model type.
   * @param entries Entry list.
   * @param fields Fields to be included in the entity.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createArray<I extends Types.Entity, O>(model: Types.ModelClass<O>, entries: I[], fields: string[]): O[] {
    return <O[]>this.createArrayEntity(model, entries, fields, false, true, false);
  }

  /**
   * Create a new entity map based on the specified model type, entry map and the fields.
   * @param model Model type.
   * @param entry Entry map.
   * @param fields Fields to be included in the entity.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createMap<I extends Types.Entity, O>(model: Types.ModelClass<O>, entry: Types.Map<I>, fields: string[]): Types.Map<O> {
    return this.createMapEntity(model, entry, fields, false, true);
  }

  /**
   * Creates a new full entity based on the specified model type, entry value and the fields.
   * @param model Model type.
   * @param entry Entry value.
   * @param fields Fields to be included in the entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   */
  @Class.Public()
  public static createFull<I extends Types.Entity, O>(model: Types.ModelClass<O>, entry: I, fields: string[]): O | undefined {
    return this.createEntity(model, entry, fields, fields.length === 0, true);
  }

  /**
   * Creates a new full entity array based on the specified model type, entry list and the fields.
   * @param model Model type.
   * @param entries Entry list.
   * @param fields Fields to be included in the entity.
   * @returns Returns the generated entity array.
   */
  @Class.Public()
  public static createFullArray<I extends Types.Entity, O>(model: Types.ModelClass<O>, entries: I[], fields: string[]): O[] {
    return <O[]>this.createArrayEntity(model, entries, fields, fields.length === 0, true, false);
  }

  /**
   * Create a new full entity map based on the specified model type, entry map and the fields.
   * @param model Model type.
   * @param entry Entry map.
   * @param fields Fields to be included in the entity.
   * @returns Returns the generated entity map.
   */
  @Class.Public()
  public static createFullMap<I extends Types.Entity, O>(model: Types.ModelClass<O>, entry: Types.Map<I>, fields: string[]): Types.Map<O> {
    return this.createMapEntity(model, entry, fields, fields.length === 0, true);
  }
}
