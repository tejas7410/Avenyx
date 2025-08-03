// **************** This is my container for my dependency injections with 'inversify' ****************

import "reflect-metadata";
import { Container } from "inversify";
import {IBasketRepository} from "../src/repositories/IBasketRepository";
import {BasketRepository} from "../src/repositories/BasketRepository";
import {IBasketService} from "../src/services/IBasketService";
import {BasketService} from "../src/services/BasketService";
import {BasketController } from "../src/controllers/BasketController";
import { IBasketRedisService } from "../infrastructure/redis/IBasketRedisService";
import { BasketRedisService } from "../infrastructure/redis/BasketRedisService";
import {IBasketItemRepository} from "../src/repositories/IBasketItemRepository";
import {BasketItemRepository} from "../src/repositories/BasketItemRepository";
import {IUserValidRepository} from "../src/repositories/IUserValidRepository";
import {UserValidRepository} from "../src/repositories/UserValidRepository";
import { BasketEventConsumer } from "../infrastructure/kafka/main";
import { IWebSocketService } from "../src/services/IWebSocketService";
import { WebSocketService } from "../src/services/WebSocketService";
import Redis from "ioredis";
import { redisClient } from "./redis"

const container = new Container();

container.bind<Redis>("RedisClient").toConstantValue(redisClient);

// ▼ My dependency injection settings here ▼

container.bind<IBasketRepository>("IBasketRepository").to(BasketRepository);

container.bind<IBasketItemRepository>("IBasketItemRepository").to(BasketItemRepository);

container.bind<IUserValidRepository>("IUserValidRepository").to(UserValidRepository);

container.bind<IBasketService>("IBasketService").to(BasketService);

container.bind<BasketController>(BasketController).toSelf();

container.bind<IBasketRedisService>("IBasketRedisService").to(BasketRedisService);


container
.bind<BasketEventConsumer>("BasketEventConsumer")
.to(BasketEventConsumer)
.inSingletonScope();

container.bind<IWebSocketService>("IWebSocketService")
  .to(WebSocketService)
  .inSingletonScope();


export { container };