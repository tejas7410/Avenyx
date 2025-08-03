// **************** Product Redis Service Settings ****************

import Redis from "ioredis";
import { inject, injectable } from "inversify";
import { IProductRedisService } from "./IProductRedisService";
import { Product } from "../../src/models/ProductModel";
import { logger } from "../../../config/logger";
import { PaginationResponse } from "../../src/types/ServiceMessage";

@injectable()
export class ProductRedisService implements IProductRedisService {
  private _redis: Redis;
  private DEFAULT_EXP = 3600; // Default expiration time I defined 1 hour

  constructor(@inject("RedisClient") redisClient: Redis) {
    
    this._redis = redisClient;

  }

  async cacheProduct(
    key: string,
    product: Product | Product[] | PaginationResponse<Product>
  ): Promise<void> {
    try {
      
      const pipeline = this._redis.pipeline();
  
      pipeline.setex(
        `product:${key}`,
        this.DEFAULT_EXP,
        JSON.stringify(product)
      );
  
      pipeline.sadd("product:keys", `product:${key}`);
  
      await pipeline.exec();

    } catch (error) {
      logger.error("[ProductRedisService - cacheProduct], ",error)
    }
  }

  async getCachedProduct(key: string): Promise<Product | Product[] | null> {
    
    try {
      const data = await this._redis.get(`product:${key}`);
  
      if (data) {
        const parsedData = JSON.parse(data);
  
        // -> If it is an array, return the array (single key or 'all' in my scenario )
        if (Array.isArray(parsedData)) {
          return parsedData as Product[];
        }
  
        // -> If it is a single product, return it directly
        return parsedData as Product;
      }
  
      return null;

    } catch (error) {
      logger.error("[ProductRedisService] Error retrieving product from Redis:", error);
      return null;
    }
  }

  async invalidateCache(key: string): Promise<void> {
    try {
      const pipeline = this._redis.pipeline();

      pipeline.del(`product:${key}`);

      pipeline.srem("product:keys", `product:${key}`);

      await pipeline.exec();
    } catch (error) {
      console.error("Error invalidating product cache:", error);
    }
  }

  // -> This is for completely deleting product cache
async invalidateAllProductCache(): Promise<void> {
  try {
    // -> Get all product cache keys from the set 'product:keys'
    const keys = await this._redis.smembers("product:keys");

    if (keys && keys.length > 0) {
      const pipeline = this._redis.pipeline();

      // -> Delete all product keys (e.g., product:6761744c9b92f8106a97c556, etc.)
      pipeline.del(...keys);

      // -> Clear the set of cache keys ('product:keys')
      pipeline.del("product:keys");

      await pipeline.exec();

      console.log("All product caches invalidated successfully.");
      
    } else {
      console.log("No product cache keys found.");
    }
  } catch (error) {
    console.error("Error invalidating all product cache:", error);
  }
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
