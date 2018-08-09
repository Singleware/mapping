/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Operators } from './operators';
/**
 * Filter operation interface.
 */
export interface Operation {
    /**
     * Filter operator.
     */
    operator: Operators;
    /**
     * Filter operation value.
     */
    value: any;
}
