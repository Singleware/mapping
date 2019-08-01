/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from '../types';

/**
 * Date helper class.
 */
@Class.Describe()
export class ISODate extends Class.Null {
  /**
   * Try to converts the specified value to a new ISO date object.
   * @param value Casting value.
   * @param type Casting type.
   * @returns Returns the ISO date object when the conversion was successful, otherwise returns the same value.
   */
  @Class.Public()
  public static Object<T>(value: T | (T | T[])[], type: Types.Cast): (T | Date) | ((T | Date) | (T | Date[]))[] {
    if (value instanceof Array) {
      return <((T | Date) | (T | Date[]))[]>value.map(value => this.Object(value, type));
    } else if (Date.parse(<any>value)) {
      return new Date(<any>value);
    } else {
      return value;
    }
  }

  /**
   * Try to converts the specified value to a new ISO date string.
   * @param value Casting value.
   * @param type Casting type.
   * @returns Returns the ISO date string when the conversion was successful, otherwise returns the same value.
   */
  @Class.Public()
  public static String<T>(value: T | (T | T[])[], type: Types.Cast): (T | string) | ((T | string) | (T | string)[])[] {
    if (value instanceof Array) {
      return <((T | string) | (T | string)[])[]>value.map(value => this.String(value, type));
    } else if (value instanceof Date) {
      const date = value.toISOString().substr(0, 19);
      const offset = Math.trunc(Math.abs(value.getTimezoneOffset() / 60)).toString();
      const timezone = (value.getTimezoneOffset() < 0 ? '-' : '+') + offset.padStart(2, '0') + ':00';
      return date + timezone;
    } else {
      return value;
    }
  }
}
