/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Columns from './columns';

import { Schema } from './schema';

/**
 * Type definition for array values accepted by entities.
 */
type ArrayValue<T> = (T | T[])[];

/**
 * Type definition for the generic values accepted by entities.
 */
type GenericValue<G, T> = G | T | ArrayValue<T> | Types.Map<T>;

/**
 * Entity helper class.
 */
@Class.Describe()
export class Entity extends Class.Null {
  /**
   * Converts the specified input value to an entity, if possible.
   * @param column Column schema.
   * @param value Value to be converted.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the original or the converted value.
   */
  @Class.Private()
  private static createInputValue<I extends Types.Entity, O extends Types.Entity, G>(column: Columns.Base<O>, value: GenericValue<G, I>, full: boolean): GenericValue<G, O> | undefined {
    if (!column.model || !Schema.isEntity(column.model)) {
      return <G>value;
    } else if (column.formats.includes(Types.Format.ARRAY)) {
      if (!(value instanceof Array)) {
        const name = (column as Columns.Real<O>).alias || column.name;
        throw new TypeError(`Column '${name}' in the model '${Schema.getStorage(column.model)}' must be an array.`);
      } else {
        return this.createInputArrayEntity(column.model, value, full, <boolean>(<Columns.Virtual<O>>column).all);
      }
    } else if (column.formats.includes(Types.Format.MAP)) {
      if (!(value instanceof Object)) {
        const name = (column as Columns.Real<O>).alias || column.name;
        throw new TypeError(`Column '${name}' in the model '${Schema.getStorage(column.model)}' must be an map.`);
      } else {
        return this.createInputMapEntity(column.model, value, full);
      }
    } else {
      return this.createInputEntity(column.model, value, full);
    }
  }

  /**
   * Converts the specified output value to an entity, if possible.
   * @param views View modes.
   * @param column Column schema.
   * @param value Value to be converted.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the original or the converted value.
   */
  @Class.Private()
  private static createOutputValue<I extends Types.Entity, O extends Types.Entity, G>(views: string[], column: Columns.Base<O>, value: GenericValue<G, I>, full: boolean): GenericValue<G, O> | undefined {
    if (!column.model || !Schema.isEntity(column.model)) {
      return <G>value;
    } else if (column.formats.includes(Types.Format.ARRAY)) {
      if (!(value instanceof Array)) {
        const name = (column as Columns.Real<O>).alias || column.name;
        throw new TypeError(`Column '${name}' in the model '${Schema.getStorage(column.model)}' must be an array.`);
      } else {
        return this.createOutputArrayEntity(column.model, views, value, full, <boolean>(<Columns.Virtual<O>>column).all);
      }
    } else if (column.formats.includes(Types.Format.MAP)) {
      if (!(value instanceof Object)) {
        const name = (column as Columns.Real<O>).alias || column.name;
        throw new TypeError(`Column '${name}' in the model '${Schema.getStorage(column.model)}' must be an map.`);
      } else {
        return this.createOutputMapEntity(column.model, views, value, full);
      }
    } else {
      return this.createOutputEntity(column.model, views, value, full, <boolean>column.required && column.type === 'real');
    }
  }

  /**
   * Creates a new input entity based on the specified model type and the input data.
   * @param model Model type.
   * @param data Input data.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the generated entity.
   * @throws Throws an error when some required column was not supplied or some read-only property was set.
   */
  @Class.Private()
  private static createInputEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, data: I, full: boolean): O {
    const entity = new model();
    const row = Schema.getRealRow(model);
    for (const name in row) {
      const schema = row[name];
      const source = schema.name;
      const target = schema.alias || schema.name;
      if (source in data && data[source] !== void 0) {
        if (schema.readOnly) {
          throw new Error(`Column '${name}' in the entity '${Schema.getStorage(model)}' is read-only.`);
        } else {
          const converted = schema.converter ? schema.converter(data[source]) : data[source];
          const value = this.createInputValue(schema, converted, full);
          if (value !== void 0) {
            (<any>entity)[target] = value;
          }
        }
      } else if (full && schema.required && !schema.readOnly) {
        throw new Error(`Required column '${name}' in the entity '${Schema.getStorage(model)}' was not given.`);
      }
    }
    return entity;
  }

  /**
   * Creates a new output entity based on the specified model type, view modes and the output data.
   * @param model Model type.
   * @param views View modes.
   * @param data Output data.
   * @param full Determines whether all required properties must be provided.
   * @param wanted Determines whether all properties are wanted by the parent entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when some required column was not supplied or some write-only property was set.
   */
  @Class.Private()
  private static createOutputEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I, full: boolean, wanted: boolean): O | undefined {
    const required = [];
    const entity = new model();
    const rows = { ...Schema.getRealRow(model, ...views), ...Schema.getVirtualRow(model, ...views) };
    let empty = true;
    for (const name in rows) {
      const schema = rows[name];
      const source = (<Columns.Real<O>>schema).alias || schema.name;
      const target = schema.name;
      if (source in data && data[source] !== void 0) {
        if (schema.writeOnly) {
          throw new Error(`Column '${name}' in the entity '${Schema.getStorage(model)}' is write-only.`);
        } else {
          const converted = schema.converter ? schema.converter(data[source]) : data[source];
          const value = this.createOutputValue(views, schema, converted, full);
          if (value !== void 0 && value !== null && (wanted || !empty || !this.isEmpty(value))) {
            (<any>entity)[target] = value;
            empty = false;
          }
        }
      } else if (full && schema.required && !schema.writeOnly) {
        required.push(name);
      }
    }
    if (empty && !wanted) {
      return void 0;
    }
    if (required.length) {
      throw new Error(`Required column(s) '${required.join(', ')}' in the entity '${Schema.getStorage(model)}' was not given.`);
    }
    return entity;
  }

  /**
   * Creates a new input array of entities based on the specified model type and the list of data.
   * @param model Model type.
   * @param list List of data.
   * @param full Determines whether all required properties must be provided.
   * @param multiple Determines whether each value from the specified list is another list or not.
   * @returns Returns the new generated list of entities.
   */
  @Class.Private()
  private static createInputArrayEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, list: ArrayValue<I>, full: boolean, multiple: boolean): ArrayValue<O> {
    const entities = [];
    for (const data of list) {
      let entity;
      if (multiple && data instanceof Array) {
        entity = <O[]>this.createInputArrayEntity(model, data, full, false);
      } else {
        entity = this.createInputEntity(model, data, full);
      }
      if (entity !== void 0) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /**
   * Creates a new output array of entities based on the specified model type, view modes and the list of data.
   * @param model Model type.
   * @param views View modes.
   * @param list List of data.
   * @param full Determines whether all required properties must be provided.
   * @param multiple Determines whether each value from the specified list is another list or not.
   * @returns Returns the new generated list of entities.
   */
  @Class.Private()
  private static createOutputArrayEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>, full: boolean, multiple: boolean): ArrayValue<O> {
    const entities = [];
    for (const data of list) {
      let entity;
      if (multiple && data instanceof Array) {
        entity = <O[]>this.createOutputArrayEntity(model, views, data, full, false);
      } else {
        entity = this.createOutputEntity(model, views, data, full, false);
      }
      if (entity !== void 0) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /**
   * Create a new input map of entities based on the specified model type and the map of data.
   * @param model Model type.
   * @param map Map of data.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the generated map of entities.
   */
  @Class.Private()
  private static createInputMapEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, map: Types.Map<I>, full: boolean): Types.Map<O> {
    const entities = <Types.Map<O>>{};
    for (const name in map) {
      const entity = this.createInputEntity(model, map[name], full);
      if (entity !== void 0) {
        entities[name] = entity;
      }
    }
    return entities;
  }

  /**
   * Create a new output map of entities based on the specified model type, view modes and the map of data.
   * @param model Model type.
   * @param views View modes.
   * @param map Map of data.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the generated map of entities.
   */
  @Class.Private()
  private static createOutputMapEntity<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>, full: boolean): Types.Map<O> {
    const entities = <Types.Map<O>>{};
    for (const name in map) {
      const entity = this.createOutputEntity(model, views, map[name], full, false);
      if (entity !== void 0) {
        entities[name] = entity;
      }
    }
    return entities;
  }

  /**
   * Generates a new normalized list of data based on the specified model type and the list of entities.
   * @param model Model type.
   * @param list List of entities.
   * @param multiple Determines whether each value from the specified list is another list or not.
   * @returns Returns the new normalized list of data.
   */
  @Class.Private()
  private static normalizeArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<I>, list: ArrayValue<I>, multiple: boolean): ArrayValue<O> {
    const entity = [];
    for (const item of list) {
      if (multiple && item instanceof Array) {
        entity.push(this.normalizeArray(model, item, false));
      } else {
        entity.push(this.normalize(model, item));
      }
    }
    return entity;
  }

  /**
   * Generates a new normalized map based on the specified model type and map of entities.
   * @param model Model type.
   * @param map Map of entities.
   * @returns Returns the new normalized map of data.
   */
  @Class.Private()
  private static normalizeMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<I>, map: Types.Map<I>): Types.Map<O> {
    const entity = <Types.Map<O>>{};
    for (const name in map) {
      entity[name] = this.normalize(model, map[name]);
    }
    return entity;
  }

  /**
   * Generates a new normalized value from the specified column schema and input value.
   * @param column Column schema.
   * @param value Input value.
   * @returns Returns the new normalized value or the original value when it doesn't need to be normalized.
   */
  @Class.Private()
  private static normalizeValue<I extends Types.Entity, O extends Types.Entity, G>(column: Columns.Base<I>, value: GenericValue<G, I>): GenericValue<G, O> {
    if (!column.model || !Schema.isEntity(column.model)) {
      return <G>value;
    } else if (column.formats.includes(Types.Format.ARRAY)) {
      if (!(value instanceof Array)) {
        const name = (column as Columns.Real<I>).alias || column.name;
        throw new TypeError(`Column '${name}' in the entity '${Schema.getStorage(column.model)}' must be an array.`);
      } else {
        return this.normalizeArray(column.model, value, <boolean>(<Columns.Virtual<I>>column).all);
      }
    } else if (column.formats.includes(Types.Format.MAP)) {
      if (!(value instanceof Object)) {
        const name = (column as Columns.Real<I>).alias || column.name;
        throw new TypeError(`Column '${name}' in the entity '${Schema.getStorage(column.model)}' must be a map.`);
      } else {
        return this.normalizeMap(column.model, value);
      }
    } else {
      return this.normalize(column.model, value);
    }
  }

  /**
   * Creates a new input entity based on the specified model type and the input data.
   * @param model Model type.
   * @param data Input data.
   * @returns Returns the generated entity.
   * @throws Throws an error when some required column was not supplied or some read-only property was set.
   */
  @Class.Public()
  public static createInput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, data: I): O {
    return this.createInputEntity(model, data, false);
  }

  /**
   * Creates a new full input entity based on the specified model type and the input data.
   * @param model Model type.
   * @param data Input data.
   * @returns Returns the generated entity.
   * @throws Throws an error when some required column was not supplied or some read-only property was set.
   */
  @Class.Public()
  public static createFullInput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, data: I): O {
    return this.createInputEntity(model, data, true);
  }

  /**
   * Creates a new output entity based on the specified model type, view modes and the output data.
   * @param model Model type.
   * @param views View modes.
   * @param data Output data.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when some required column was not supplied or some write-only property was set.
   */
  @Class.Public()
  public static createOutput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I): O | undefined {
    return this.createOutputEntity(model, views, data, false, true);
  }

  /**
   * Creates a new full output entity based on the specified model type, view modes and the output data.
   * @param model Model type.
   * @param views View modes.
   * @param data Output data.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when some required column was not supplied or some write-only property was set.
   */
  @Class.Public()
  public static createFullOutput<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], data: I): O | undefined {
    return this.createOutputEntity(model, views, data, true, true);
  }

  /**
   * Creates a new input array of entities based on the specified model type and the list of data.
   * @param model Model type.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createInputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, list: ArrayValue<I>): ArrayValue<O> {
    return this.createInputArrayEntity(model, list, false, false);
  }

  /**
   * Creates a new full input array of entities based on the specified model type and the list of data.
   * @param model Model type.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createFullInputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, list: ArrayValue<I>): ArrayValue<O> {
    return this.createInputArrayEntity(model, list, true, false);
  }

  /**
   * Creates a new output array of entities based on the specified model type, view modes and the list of data.
   * @param model Model type.
   * @param views View modes.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createOutputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>): ArrayValue<O> {
    return this.createOutputArrayEntity(model, views, list, false, false);
  }

  /**
   * Creates a new full output array of entities based on the specified model type, view modes and the list of data.
   * @param model Model type.
   * @param views View modes.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createFullOutputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], list: ArrayValue<I>): ArrayValue<O> {
    return this.createOutputArrayEntity(model, views, list, true, false);
  }

  /**
   * Create a new input map of entities based on the specified model type and the map of data.
   * @param model Model type.
   * @param map Map of data.
   * @returns Returns the generated map of entities.
   */
  @Class.Public()
  public static createInputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, map: Types.Map<I>): Types.Map<O> {
    return this.createInputMapEntity(model, map, false);
  }

  /**
   * Create a new full input map of entities based on the specified model type and the map of data.
   * @param model Model type.
   * @param map Map of data.
   * @returns Returns the generated map of entities.
   */
  @Class.Public()
  public static createFullInputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, map: Types.Map<I>): Types.Map<O> {
    return this.createInputMapEntity(model, map, true);
  }

  /**
   * Create a new output map of entities based on the specified model type, view modes and the map of data.
   * @param model Model type.
   * @param views View modes.
   * @param map Map of data.
   * @returns Returns the generated map of entities.
   */
  @Class.Public()
  public static createOutputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>): Types.Map<O> {
    return this.createOutputMapEntity(model, views, map, false);
  }

  /**
   * Create a new full output map of entities based on the specified model type, view modes and the map of data.
   * @param model Model type.
   * @param views View modes.
   * @param map Map of data.
   * @returns Returns the generated map of entities.
   */
  @Class.Public()
  public static createFullOutputMap<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, views: string[], map: Types.Map<I>): Types.Map<O> {
    return this.createOutputMapEntity(model, views, map, true);
  }

  /**
   * Generates a new normalized entity based on the specified model type and input data.
   * @param model Model type.
   * @param data Input data.
   * @returns Returns the new normalized entity data.
   */
  @Class.Public()
  public static normalize<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<I>, data: I): O {
    const rows = { ...Schema.getRealRow(model), ...Schema.getVirtualRow(model) };
    const entity = <O>{};
    for (const name in data) {
      const value = data[name];
      const column = rows[name];
      if (value !== void 0 && column !== void 0 && !column.hidden) {
        entity[name] = <any>this.normalizeValue(column, value);
      }
    }
    return entity;
  }

  /**
   * Determines whether the specified value is empty or not.
   * @param value Value to be checked.
   * @returns Returns true when the specified value is empty or false otherwise.
   */
  @Class.Public()
  public static isEmpty<E extends Types.Entity, T>(value: T | T[] | Types.Model<E>): boolean {
    if (value instanceof Array) {
      return value.length === 0;
    } else if (value instanceof Object) {
      return !Schema.isEntity(<Types.Model<E>>value) && Object.keys(value).length === 0;
    } else {
      return value === void 0 || value === null;
    }
  }
}
