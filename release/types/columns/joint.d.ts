/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Types from '../types';

import { Virtual } from './virtual';

/**
 * Joint column interface.
 */
export interface Joint extends Virtual {
  /**
   * Determines whether the local column contains multiple IDs.
   */
  multiple: boolean;
}
