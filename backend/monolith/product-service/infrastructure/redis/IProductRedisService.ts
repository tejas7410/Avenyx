// -> Redis Servis Interface

import { Product } from "../../src/models/ProductModel";
import { PaginationResponse } from "../../src/types/ServiceMessage";

export interface IProductRedisService {
  cacheProduct(
    key: string,
    product: Product | Product[] | PaginationResponse<Product>
  ): Promise<void>;
  getCachedProduct(key: string): Promise<Product | Product[] | null>;
  invalidateCache(key: string): Promise<void>;
  invalidateAllProductCache(): Promise<void>;
  ping(): Promise<boolean>;
}
