// **************** Basket Redis Service Settings ****************

import { inject, injectable } from "inversify";
import { IBasketRedisService } from "./IBasketRedisService";
import Redis from "ioredis";
import { ServiceMessage } from "../../src/types/ServiceMessage";

@injectable()
export class BasketRedisService implements IBasketRedisService {
  private _redis: Redis;
  private DEFAULT_EXP = 3600;

  constructor(@inject("RedisClient") redisClient: Redis) {
    this._redis = redisClient;
  }

  // -> Generic T get from redis cache method I define
  async getCache<T>(key: string): Promise<ServiceMessage<T | null>> {
   
    const value = await this._redis.get(key);

    if (value === null) {
      return new ServiceMessage(
        false,
        `There is no value with that ${key} key...`,
        null
      );
    }

    try {
      const data = JSON.parse(value) as T;
      return new ServiceMessage(
        true,
        `Getting data from cache with ${key} key is succesful...`,
        data
      );
    } catch (error) {
      return new ServiceMessage(
        false,
        `An error occured while getting with ${key} key from 'Redis Service'...`
      );
    }
  }

  // -> Generic T set cache to redis method I define
  async setCache<T>(
    key: string,
    value: T,
    expiry: number = this.DEFAULT_EXP
  ): Promise<ServiceMessage> {
    try {
      const jsonValue = JSON.stringify(value);

      await this._redis.setex(key, expiry, jsonValue);

      return new ServiceMessage(
        true,
        `Data successfully set in cache with key: ${key}.`
      );
    } catch (error) {
      return new ServiceMessage(
        false,
        `An error occurred while setting data in 'Redis Service' for key: ${key}.`
      );
    }
  }

  // -> Generic T delete cache from redis method
  async deleteCache(key: string): Promise<ServiceMessage<null>> {
    try {

      const deleteResult = await this._redis.del(key);

      if (deleteResult === 0) {
        return new ServiceMessage(
          false,
          `No deleted cache found for key: ${key}.`
        );
      }

      return new ServiceMessage(
        true,
        `Delete processes from cache is succesfull for key: ${key}.`
      );
    } catch (error) {
      return new ServiceMessage(
        false,
        `An error occurred while deleting data for key: ${key} in 'Redis Service'.`
      );
    }
  }

  async getKeys(key: string) {
    const keys = this._redis.keys(key);
    return keys;
  }

  // -> I created this for usage redis.ping in code if need ( redis.ping returns pong as default in redis )
  async ping(): Promise<boolean> {
    try {
      const response = await this._redis.ping();
      return response === "PONG";
    } catch (error) {
      console.error("Redis connection failed:", error);
      return false;
    }
  }
}
