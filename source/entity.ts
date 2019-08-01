/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Columns from './columns';

import { Schema } from './schema';

/**
 * Array values alias.
 */
type Arrays<T> = (T | T[])[];

/**
 * Generic values alias.
 */
type Values<G, T> = G | T | Arrays<T> | Types.Map<T>;

/**
 * Entity helper class.
 */
@Class.Describe()
export class Entity extends Class.Null {
  /**
   * Determines whether the specified value is a filled result or not.
   * @param value Value to check.
   * @returns Returns true when the specified value is filled, false otherwise.
   */
  @Class.Private()
  private static isFilledResult<E extends Types.Entity, T>(value: T[] | Types.Model<E>): boolean {
    if (value instanceof Array) {
      return value.length === 0;
    } else if (value instanceof Object) {
      return !Schema.isEntity(<Types.Model<E>>value) && Object.keys(value).length === 0;
    }
    return false;
  }

  /**
   * Converts the specified input value to an entity, if possible.
   * @param column Column schema.
   * @param value Value to be converted.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the original or the converted value.
   */
  @Class.Private()
  private static createInputValue<I extends Types.Entity, O extends Types.Entity, G>(
    column: Columns.Base<O>,
    value: Values<G, I>,
    full: boolean
  ): Values<G, O> | undefined {
    if (!column.model || !Schema.isEntity(column.model) || (value === null && column.formats.includes(Types.Format.Null))) {
      return <G>value;
    } else if (column.formats.includes(Types.Format.Array)) {
      if (!(value instanceof Array)) {
        throw new TypeError(`Column '${Schema.getColumnName(column)}' in '${Schema.getStorageName(column.model)}' must be an array.`);
      } else {
        return this.createInputArrayEntity(column.model, value, full, <boolean>(<Columns.Virtual<O>>column).all);
      }
    } else if (column.formats.includes(Types.Format.Map)) {
      if (!(value instanceof Object)) {
        throw new TypeError(`Column '${Schema.getColumnName(column)}' in '${Schema.getStorageName(column.model)}' must be an map.`);
      } else {
        return this.createInputMapEntity(column.model, value, full);
      }
    } else {
      return this.createInputEntity(column.model, value, full);
    }
  }

  /**
   * Converts the specified output value to an entity, if possible.
   * @param fields Viewed fields.
   * @param column Column schema.
   * @param value Value to be converted.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the original or the converted value.
   */
  @Class.Private()
  private static createOutputValue<I extends Types.Entity, O extends Types.Entity, G>(
    fields: string[],
    column: Columns.Base<O>,
    value: Values<G, I>,
    full: boolean
  ): Values<G, O> | undefined {
    if (!column.model || !Schema.isEntity(column.model) || (value === null && column.formats.includes(Types.Format.Null))) {
      return <G>value;
    } else if (column.formats.includes(Types.Format.Array)) {
      if (!(value instanceof Array)) {
        throw new TypeError(`Column '${Schema.getColumnName(column)}' in '${Schema.getStorageName(column.model)}' must be an array.`);
      } else {
        return this.createOutputArrayEntity(column.model, fields, value, full, <boolean>(<Columns.Virtual<O>>column).all);
      }
    } else if (column.formats.includes(Types.Format.Map)) {
      if (!(value instanceof Object)) {
        throw new TypeError(`Column '${Schema.getColumnName(column)}' in '${Schema.getStorageName(column.model)}' must be an map.`);
      } else {
        return this.createOutputMapEntity(column.model, fields, value, full);
      }
    } else {
      return this.createOutputEntity(column.model, fields, value, full, <boolean>column.required && column.type === Types.Column.Real);
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
    const entity = <any>new model();
    const row = Schema.getRealRow(model);
    for (const name in row) {
      const column = row[name];
      const source = column.name;
      const target = Schema.getColumnName(column);
      if (source in data && data[source] !== void 0) {
        if (column.readOnly) {
          throw new Error(`Column '${name}' in '${Schema.getStorageName(model)}' is read-only.`);
        } else {
          const converted = column.caster ? column.caster(data[source], Types.Cast.Input) : data[source];
          const value = this.createInputValue(column, converted, full);
          if (value !== void 0) {
            entity[target] = value;
          }
        }
      } else if (full && column.required && !column.readOnly) {
        throw new Error(`Column '${name}' required by '${Schema.getStorageName(model)}' wasn't given.`);
      }
    }
    return entity;
  }

  /**
   * Creates a new output entity based on the specified model type, viewed fields and the output data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param data Output data.
   * @param full Determines whether all required properties must be provided.
   * @param wanted Determines whether all properties are wanted by the parent entity.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when some required column was not supplied or some write-only property was set.
   */
  @Class.Private()
  private static createOutputEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    data: I,
    full: boolean,
    wanted: boolean
  ): O | undefined {
    const required = [];
    const entity = <any>new model();
    const rows = { ...Schema.getRealRow(model, ...fields), ...Schema.getVirtualRow(model, ...fields) };
    let filled = false;
    for (const name in rows) {
      const column = rows[name];
      const source = Schema.getColumnName(column);
      const target = column.name;
      if (source in data && data[source] !== void 0) {
        if (column.writeOnly) {
          throw new Error(`Column '${name}' in '${Schema.getStorageName(model)}' is write-only.`);
        } else {
          const converted = column.caster ? column.caster(data[source], Types.Cast.Output) : data[source];
          const value = this.createOutputValue(fields, column, converted, full);
          if (value !== void 0 && (wanted || filled || !this.isFilledResult(value))) {
            entity[target] = value;
            filled = true;
          }
        }
      } else if (full && column.required && !column.writeOnly) {
        required.push(name);
      }
    }
    if (!filled && !wanted) {
      return void 0;
    }
    if (required.length) {
      throw new Error(`Column(s) '${required.join(', ')}' required by '${Schema.getStorageName(model)}' wasn't given.`);
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
  private static createInputArrayEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    list: Arrays<I>,
    full: boolean,
    multiple: boolean
  ): Arrays<O> {
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
   * Creates a new output array of entities based on the specified model type, viewed fields and the list of data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param list List of data.
   * @param full Determines whether all required properties must be provided.
   * @param multiple Determines whether each value from the specified list is another list or not.
   * @returns Returns the new generated list of entities.
   */
  @Class.Private()
  private static createOutputArrayEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    list: Arrays<I>,
    full: boolean,
    multiple: boolean
  ): Arrays<O> {
    const entities = [];
    for (const data of list) {
      let entity;
      if (multiple && data instanceof Array) {
        entity = <O[]>this.createOutputArrayEntity(model, fields, data, full, false);
      } else {
        entity = this.createOutputEntity(model, fields, data, full, false);
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
  private static createInputMapEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    map: Types.Map<I>,
    full: boolean
  ): Types.Map<O> {
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
   * Create a new output map of entities based on the specified model type, viewed fields and the map of data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param map Map of data.
   * @param full Determines whether all required properties must be provided.
   * @returns Returns the generated map of entities.
   */
  @Class.Private()
  private static createOutputMapEntity<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    map: Types.Map<I>,
    full: boolean
  ): Types.Map<O> {
    const entities = <Types.Map<O>>{};
    for (const name in map) {
      const entity = this.createOutputEntity(model, fields, map[name], full, false);
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
  private static normalizeArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<I>,
    list: Arrays<I>,
    multiple: boolean
  ): Arrays<O> {
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
  private static normalizeValue<I extends Types.Entity, O extends Types.Entity, G>(
    column: Columns.Base<I>,
    value: Values<G, I>
  ): Values<G, O> {
    if (!column.model || !Schema.isEntity(column.model) || (value === null && column.formats.includes(Types.Format.Null))) {
      return <G>value;
    } else if (column.formats.includes(Types.Format.Array)) {
      if (!(value instanceof Array)) {
        throw new TypeError(`Column '${Schema.getColumnName(column)}' in '${Schema.getStorageName(column.model)}' must be an array.`);
      } else {
        return this.normalizeArray(column.model, value, <boolean>(<Columns.Virtual<I>>column).all);
      }
    } else if (column.formats.includes(Types.Format.Map)) {
      if (!(value instanceof Object)) {
        throw new TypeError(`Column '${Schema.getColumnName(column)}' in '${Schema.getStorageName(column.model)}' must be a map.`);
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
   * Creates a new output entity based on the specified model type, viewed fields and the output data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param data Output data.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when some required column was not supplied or some write-only property was set.
   */
  @Class.Public()
  public static createOutput<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    data: I
  ): O | undefined {
    return this.createOutputEntity(model, fields, data, false, true);
  }

  /**
   * Creates a new full output entity based on the specified model type, viewed fields and the output data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param data Output data.
   * @returns Returns the generated entity or undefined when the entity has no data.
   * @throws Throws an error when some required column was not supplied or some write-only property was set.
   */
  @Class.Public()
  public static createFullOutput<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    data: I
  ): O | undefined {
    return this.createOutputEntity(model, fields, data, true, true);
  }

  /**
   * Creates a new input array of entities based on the specified model type and the list of data.
   * @param model Model type.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createInputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, list: Arrays<I>): Arrays<O> {
    return this.createInputArrayEntity(model, list, false, false);
  }

  /**
   * Creates a new full input array of entities based on the specified model type and the list of data.
   * @param model Model type.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createFullInputArray<I extends Types.Entity, O extends Types.Entity>(model: Types.Model<O>, list: Arrays<I>): Arrays<O> {
    return this.createInputArrayEntity(model, list, true, false);
  }

  /**
   * Creates a new output array of entities based on the specified model type, viewed fields and the list of data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createOutputArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    list: Arrays<I>
  ): Arrays<O> {
    return this.createOutputArrayEntity(model, fields, list, false, false);
  }

  /**
   * Creates a new full output array of entities based on the specified model type, viewed fields and the list of data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param list List of data.
   * @returns Returns the new generated list of entities.
   */
  @Class.Public()
  public static createFullOutputArray<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    views: string[],
    list: Arrays<I>
  ): Arrays<O> {
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
   * Create a new output map of entities based on the specified model type, viewed fields and the map of data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param map Map of data.
   * @returns Returns the generated map of entities.
   */
  @Class.Public()
  public static createOutputMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    map: Types.Map<I>
  ): Types.Map<O> {
    return this.createOutputMapEntity(model, fields, map, false);
  }

  /**
   * Create a new full output map of entities based on the specified model type, viewed fields and the map of data.
   * @param model Model type.
   * @param fields Viewed fields.
   * @param map Map of data.
   * @returns Returns the generated map of entities.
   */
  @Class.Public()
  public static createFullOutputMap<I extends Types.Entity, O extends Types.Entity>(
    model: Types.Model<O>,
    fields: string[],
    map: Types.Map<I>
  ): Types.Map<O> {
    return this.createOutputMapEntity(model, fields, map, true);
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
}
