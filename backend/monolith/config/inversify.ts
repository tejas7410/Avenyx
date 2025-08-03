// **************** This is my container for my dependency injections with 'inversify' ****************

import "reflect-metadata";
import { Container } from "inversify";
import { IAuthRepository } from "../identity-service/src/repositories/IAuthRepository";
import { AuthRepository } from "../identity-service/src/repositories/AuthRepository";
import { IAuthService } from "../identity-service/src/services/IAuthService";
import { AuthService } from "../identity-service/src/services/AuthService";
import { AuthController } from "../identity-service/src/controllers/AuthController";
import { IProductRepository } from "../product-service/src/repositories/IProductRepository";
import { ProductRepository } from "../product-service/src/repositories/ProductRepository";
import { IProductService } from "../product-service/src/services/IProductService";
import { ProductService } from "../product-service/src/services/ProductService";
import { ProductController } from "../product-service/src/controllers/ProductController";
import { IUserRepository } from "../identity-service/src/repositories/IUserRepository";
import { UserRepository } from "../identity-service/src/repositories/UserRepository";
import { IUserService } from "../identity-service/src/services/IUserService";
import { UserService } from "../identity-service/src/services/UserService";
import { UserController } from "../identity-service/src/controllers/UserController";
import { IdentityRedisService } from "../identity-service/infrastructure/redis/IdentityRedisService";
import { IIdentityRedisService } from "../identity-service/infrastructure/redis/IIdentityRedisService";
import { ProductRedisService } from "../product-service/infrastructure/redis/ProductRedisService";
import { IProductRedisService } from "../product-service/infrastructure/redis/IProductRedisService";
import Redis from "ioredis";
import { redisClient } from "./redis";
import { UserEventPublisher } from "../identity-service/infrastructure/kafka/UserEventPublisher";
import { ProductEventPublisher } from "../product-service/infrastructure/kafka/ProductEventPublisher";

const container = new Container();

// ▼ My dependency injection settings in monolith project here ▼

container.bind<Redis>("RedisClient").toConstantValue(redisClient);

container.bind<IAuthRepository>("IAuthRepository").to(AuthRepository);
container.bind<IAuthService>("IAuthService").to(AuthService);
container.bind<AuthController>(AuthController).toSelf();

container.bind<IUserRepository>("IUserRepository").to(UserRepository);
container.bind<IUserService>("IUserService").to(UserService);
container.bind<UserController>(UserController).toSelf();

container.bind<IProductRepository>("IProductRepository").to(ProductRepository);
container.bind<IProductService>("IProductService").to(ProductService);
container.bind<ProductController>(ProductController).toSelf();

container.bind<IIdentityRedisService>("IIdentityRedisService").to(IdentityRedisService);
container.bind<IProductRedisService>("IProductRedisService").to(ProductRedisService);


container
  .bind<UserEventPublisher>("UserEventPublisher")
  .to(UserEventPublisher)
  .inSingletonScope();

  container
  .bind<ProductEventPublisher>("ProductEventPublisher")
  .to(ProductEventPublisher)
  .inSingletonScope();

export { container };
