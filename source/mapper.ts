/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import * as Types from './types';
import * as Filters from './filters';
import * as Entities from './entities';
import * as Columns from './columns';

import { Schema } from './schema';
import { Driver } from './driver';

/**
 * Generic data mapper class.
 */
@Class.Describe()
export class Mapper<Output extends Types.Entity, Input extends Types.Entity = Output, Options extends Types.Options = {}> extends Class.Null {
  /**
   * Data driver.
   */
  @Class.Private()
  private driver: Driver;

  /**
   * Output entity model.
   */
  @Class.Private()
  private output: Types.ModelClass<Output>;

  /**
   * Input entity model.
   */
  @Class.Private()
  private input: Types.ModelClass<Output | Input>;

  /**
   * Default constructor.
   * @param driver Data driver.
   * @param output Output entity model.
   * @param input Input entity model.
   * @throws Throws an error when the model isn't a valid entity.
   */
  public constructor(driver: Driver, output: Types.ModelClass<Output>, input: Types.ModelClass<Output | Input> = output) {
    super();
    if (!Schema.isEntity(output) || !Schema.isEntity(input)) {
      throw new Error(`Invalid input and/or output entity model.`);
    }
    this.driver = driver;
    this.output = output;
    this.input = input;
  }

  /**
   * Insert the specified entity list into the storage using a custom model type.
   * @param model Model type.
   * @param entities Entity list.
   * @param options Insert options.
   * @returns Returns a promise to get the Id list of all inserted entities or undefined when an error occurs.
   */
  @Class.Public()
  public async insertManyEx<E, R>(model: Types.ModelClass<E>, entities: E[], options?: Options): Promise<R[] | undefined> {
    const input = Entities.Inputer.createFullArray(model, entities);
    return await this.driver.insert(model, input, options ?? {});
  }

  /**
   * Insert the specified entity list into the storage.
   * @param entities Entity list.
   * @param options Insert options.
   * @returns Returns a promise to get the Id list of all inserted entities or undefined when an error occurs.
   */
  @Class.Public()
  public async insertMany<E extends Input, R>(entities: E[], options?: Options): Promise<R[] | undefined> {
    return await this.insertManyEx(this.input, entities, options);
  }

  /**
   * Insert the specified entity into the storage using a custom model type.
   * @param model Model type.
   * @param entity Entity data.
   * @param options Insert options.
   * @returns Returns a promise to get the Id of the inserted entry or undefined when an error occurs.
   */
  @Class.Public()
  public async insertEx<E, R>(model: Types.ModelClass<E>, entity: E, options?: Options): Promise<R | undefined> {
    const output = await this.insertManyEx(model, [entity], options);
    if (output !== void 0) {
      return <R>output[0];
    }
    return void 0;
  }

  /**
   * Insert the specified entity into the storage.
   * @param entity Entity data.
   * @param options Insert options.
   * @returns Returns a promise to get the Id of the inserted entity or undefined when an error occurs.
   */
  @Class.Public()
  public async insert<E extends Input, R>(entity: E, options?: Options): Promise<R | undefined> {
    return await this.insertEx(this.input, entity, options);
  }

  /**
   * Find all corresponding entity in the storage.
   * @param query Query filter
   * @param select Fields to select.
   * @param options Find options.
   * @returns Returns a promise to get the list of entities found or undefined when an error occurs.
   */
  @Class.Public()
  public async find(query: Filters.Query, select?: string[], options?: Options): Promise<Output[] | undefined> {
    const fields = select ?? [];
    const output = await this.driver.find(this.output, query, fields, options ?? {});
    if (output !== void 0) {
      return Entities.Outputer.createFullArray(this.output, output, fields);
    }
    return void 0;
  }

  /**
   * Find the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param select Fields to select.
   * @param options Find options.
   * @returns Returns a promise to get the entity found or undefined when the entity was not found.
   */
  @Class.Public()
  public async findById<I>(id: I, select?: string[], options?: Options): Promise<Output | undefined> {
    const fields = select ?? [];
    const output = await this.driver.findById(this.output, id, fields, options ?? {});
    if (output !== void 0) {
      return Entities.Outputer.createFull(this.output, output, fields);
    }
    return void 0;
  }

  /**
   * Gets the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param select Fields to select.
   * @param options Find options.
   * @returns Returns a promise to get the entity.
   * @throws Throws an error when the entity wasn't found.
   */
  @Class.Public()
  public async getById<I>(id: I, select?: string[], options?: Options): Promise<Output> {
    const output = await this.findById(id, select, options);
    if (output === void 0) {
      throw new Error(`Failed to get the entity in '${Schema.getStorageName(this.output)}' with '${id}' as Id.`);
    }
    return output;
  }

  /**
   * Update all entities that corresponds to the specified match using a custom model type.
   * @param model Model type.
   * @param match Matching filter.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get the number of updated entities or undefined when an error occurs.
   */
  @Class.Public()
  public async updateEx<E>(model: Types.ModelClass<E>, match: Filters.Match, entity: E, options?: Options): Promise<number | undefined> {
    const input = Entities.Inputer.createFull(model, entity);
    return this.driver.update(model, match, input, options ?? {});
  }

  /**
   * Update all entities that corresponds to the specified match.
   * @param match Matching filter.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get the number of updated entities.
   */
  @Class.Public()
  public async update<E extends Partial<Input>>(match: Filters.Match, entity: E, options?: Options): Promise<number | undefined> {
    const input = Entities.Inputer.create(this.input, entity);
    return this.driver.update(this.input, match, input, options ?? {});
  }

  /**
   * Update the entity that corresponds to the specified id using a custom model type.
   * @param model Model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get the true when the entity was updated either undefined when an error occurs or false otherwise.
   */
  @Class.Public()
  public async updateByIdEx<E, I>(model: Types.ModelClass<E>, id: I, entity: E, options?: Options): Promise<boolean | undefined> {
    const input = Entities.Inputer.createFull(model, entity);
    return this.driver.updateById(model, id, input, options ?? {});
  }

  /**
   * Update the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param entity Entity data.
   * @param options Update options.
   * @returns Returns a promise to get the true when the entity was updated either undefined when an error occurs or false otherwise.
   */
  @Class.Public()
  public async updateById<E extends Partial<Input>, I>(id: I, entity: E, options?: Options): Promise<boolean | undefined> {
    const input = Entities.Inputer.create(this.input, entity);
    return this.driver.updateById(this.input, id, input, options ?? {});
  }

  /**
   * Replace the entity that corresponds to the specified entity Id using a custom model type.
   * @param id Entity Id.
   * @param entity Entity data.
   * @param options Replace options.
   * @returns Returns a promise to get the true when the entity was replaced either undefined when an error occurs or false otherwise.
   */
  @Class.Public()
  public async replaceByIdEx<E, I>(model: Types.ModelClass<E>, id: I, entity: E, options?: Options): Promise<boolean | undefined> {
    const input = Entities.Inputer.createFull(model, entity);
    return this.driver.replaceById(model, id, input, options ?? {});
  }

  /**
   * Replace the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param entity Entity data.
   * @param options Replace options.
   * @returns Returns a promise to get the true when the entity was replaced either undefined when an error occurs or false otherwise.
   */
  @Class.Public()
  public async replaceById<E extends Input, I>(id: I, entity: E, options?: Options): Promise<boolean | undefined> {
    const input = Entities.Inputer.create(this.input, entity);
    return this.driver.replaceById(this.input, id, input, options ?? {});
  }

  /**
   * Delete all entities that corresponds to the specified match.
   * @param match Matching filter.
   * @param options Delete options.
   * @return Returns a promise to get the number of deleted entities or undefined when an error occurs.
   */
  @Class.Public()
  public async delete(match: Filters.Match, options?: Options): Promise<number | undefined> {
    return this.driver.delete(this.output, match, options ?? {});
  }

  /**
   * Delete the entity that corresponds to the specified entity Id.
   * @param id Entity Id.
   * @param options Delete options.
   * @return Returns a promise to get the true when the entity was deleted either undefined when an error occurs or false otherwise.
   */
  @Class.Public()
  public async deleteById<I>(id: I, options?: Options): Promise<boolean | undefined> {
    return this.driver.deleteById(this.output, id, options ?? {});
  }

  /**
   * Count all corresponding entities from the storage.
   * @param query Query filter.
   * @param options Count options.
   * @returns Returns a promise to get the total amount of found entities or undefined when an error occurs.
   */
  @Class.Public()
  public async count(query: Filters.Query, options?: Options): Promise<number | undefined> {
    return this.driver.count(this.output, query, options ?? {});
  }

  /**
   * Generate a new normalized entity based on the specified entity data.
   * @param entity Entity data.
   * @param alias Determines whether or not all column names should be aliased.
   * @param unsafe Determines whether or not all hidden columns should be visible.
   * @param unroll Determines whether or not all columns should be unrolled.
   * @returns Returns the normalized entity.
   */
  @Class.Public()
  public normalize<E extends Output>(entity: E, alias?: boolean, unsafe?: boolean, unroll?: boolean): E {
    return Entities.Normalizer.create(this.output, entity, alias, unsafe, unroll);
  }

  /**
   * Normalize all entities in the specified entity list.
   * @param entities Entity list.
   * @param alias Determines whether or not all column names should be aliased.
   * @param unsafe Determines whether or not all hidden columns should be visible.
   * @param unroll Determines whether or not all columns should be unrolled.
   * @returns Returns the list of normalized entities.
   */
  @Class.Public()
  public normalizeAll<E extends Output>(entities: E[], alias?: boolean, unsafe?: boolean, unroll?: boolean): E[] {
    return entities.map(entity => this.normalize(entity, alias, unsafe, unroll));
  }

  /**
   * Normalize all entities in the specified entity list to a new map of entities.
   * @param entities Entity list.
   * @param alias Determines whether or not all column names should be aliased.
   * @param unsafe Determines whether or not all hidden columns should be visible.
   * @param unroll Determines whether or not all columns should be unrolled.
   * @returns Returns the map of normalized entities.
   */
  @Class.Public()
  public normalizeAsMap<E extends Output>(entities: E[], alias?: boolean, unsafe?: boolean, unroll?: boolean): Types.Map<E> {
    const primary = Columns.Helper.getName(Schema.getPrimaryColumn(this.output));
    const data = <Types.Map<E>>{};
    for (const input of entities) {
      const entity = this.normalize(input, alias, unsafe, unroll);
      data[entity[primary]] = entity;
    }
    return data;
  }
}
