// -> Redis Servis Interface

import {ServiceMessage} from "../../src/types/ServiceMessage";

export interface IBasketRedisService {
  
  getCache<T>(key: string): Promise<ServiceMessage<T | null>>;
  setCache<T>(key: string, value: T, expiry: number): Promise<ServiceMessage>;
  deleteCache(key: string): Promise<ServiceMessage<null>>;
  getKeys(key:string):any;
  ping(): Promise<boolean>;

}
