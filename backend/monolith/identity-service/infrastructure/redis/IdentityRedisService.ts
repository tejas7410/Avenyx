// **************** Identity Redis Service Settings ****************

import Redis from "ioredis";
import { inject, injectable } from "inversify";
import { IIdentityRedisService as IIdentityRedisService } from "./IIdentityRedisService";

@injectable()
export class IdentityRedisService implements IIdentityRedisService {
  private _redis: Redis;

  constructor(@inject("RedisClient") redisClient: Redis) {
    this._redis = redisClient;
  }

  async setToken(
    userId: string,
    token: string,
    expiryInSeconds: number = 3600
  ): Promise<void> {
    await this._redis.setex(`auth:${userId}`, expiryInSeconds, token);
  }

  async getToken(userId: string): Promise<string | null> {
    return await this._redis.get(`auth:${userId}`);
  }

  async removeToken(userId: string): Promise<void> {
    await this._redis.del(`auth:${userId}`);
  }

  // -> This is for checking redis working or not, I will check datas from Redis-Cli
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
