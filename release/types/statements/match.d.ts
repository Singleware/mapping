import { Operation } from './operation';
/**
 * Match statement interface.
 */
export interface Match {
    [column: string]: Operation;
}
