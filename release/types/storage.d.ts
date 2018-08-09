/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Row } from './row';
/**
 * Schema storage interface.
 */
export interface Storage {
    /**
     * Storage name.
     */
    name?: string;
    /**
     * Primary column name.
     */
    primary?: string;
    /**
     * Row of columns.
     */
    row: Row;
}
