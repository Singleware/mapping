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
   * @returns Returns the ISO date object when the conversion was successful, otherwise returns the given value.
   */
  @Class.Public()
  public static Object<T>(value: T | T[], type: Types.Cast): (T | Date) | (T | Date)[] {
    if (value instanceof Array) {
      return value.map(value => <T | Date>this.Object(value, type));
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
   * @returns Returns the ISO date string when the conversion was successful, otherwise returns the given value.
   */
  @Class.Public()
  public static String<T>(value: T | T[], type: Types.Cast): (T | string) | (T | string)[] {
    if (value instanceof Array) {
      return value.map(value => <T | string>this.String(value, type));
    } else if (value instanceof Date) {
      const offset = value.getTimezoneOffset();
      const hour = Math.trunc(Math.abs(offset / 60)).toString();
      const min = Math.trunc(Math.abs(offset % 60)).toString();
      return value.toISOString().substr(0, 19) + (offset < 0 ? '+' : '-') + hour.padStart(2, '0') + ':' + min.padStart(2, '0');
    } else {
      return value;
    }
  }
}
