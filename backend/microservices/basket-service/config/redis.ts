// **************** My Redis Config ****************

import Redis from "ioredis";

const redisConfig = {
    
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  };
  
export const redisClient = new Redis(redisConfig);