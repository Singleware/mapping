/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from '../types';

import { Base } from './base';
import { Real } from './real';
import { Virtual } from './virtual';

/**
 * Columns helper class.
 */
@Class.Describe()
export class Helper extends Class.Null {
  /**
   * Gets the column name from the specified column schema.
   * @param schema Column schema.
   * @returns Returns the column name.
   */
  @Class.Public()
  public static getName<E extends Types.Entity>(schema: Base<E>): string {
    return (<Real<E>>schema).alias || schema.name;
  }

  /**
   * Get a new path based on the specified column schemas.
   * @param schemas Column schemas.
   * @returns Returns a new path generated from the column schemas.
   */
  @Class.Public()
  public static getPath(schemas: Base[]): string {
    let path = [];
    for (const current of schemas) {
      path.push(this.getName(current));
    }
    return path.join('.');
  }

  /**
   * Get all nested fields from the given column schema and the field list.
   * @param schema Column schema.
   * @param fields Fields to be selected.
   * @returns Returns a new field list containing all nested fields.
   */
  @Class.Public()
  public static getNestedFields<E extends Types.Entity>(schema: Base<E>, fields: string[]): string[] {
    const list = [];
    const prefix = `${this.getName(schema)}.`;
    for (const field of fields) {
      if (field.startsWith(prefix)) {
        const suffix = field.substr(prefix.length);
        if (suffix.length > 0 && suffix !== '*') {
          list.push(suffix);
        }
      }
    }
    return list;
  }

  /**
   * Determines whether or not the specified column is a real column.
   * @param column Column object.
   * @returns Returns true when the column is a real column, false otherwise.
   */
  @Class.Public()
  public static isReal<E extends Types.Entity>(column: Base<E>): column is Real<E> {
    return column.type === Types.Column.Real;
  }

  /**
   * Determines whether or not the specified column is a virtual column.
   * @param column Column object.
   * @returns Returns true when the column is a virtual column, false otherwise.
   */
  @Class.Public()
  public static isVirtual<E extends Types.Entity>(column: Base<E>): column is Virtual<E> {
    return column.type === Types.Column.Virtual;
  }

  /**
   * Determines whether or not the specified column is visible based on the given fields.
   * @param schema Column schema.
   * @param fields Visible fields.
   * @returns Returns true when the column is visible, false otherwise.
   */
  @Class.Public()
  public static isVisible<E extends Types.Entity>(schema: Base<E>, ...fields: string[]): boolean {
    if (fields.length > 0) {
      const column = schema.name;
      for (const field of fields) {
        if (column === field || field.startsWith(`${column}.`)) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
}
