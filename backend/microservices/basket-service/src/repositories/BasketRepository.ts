import { inject, injectable } from "inversify";
import { IBasketRepository } from "./IBasketRepository";
import { IBasketRedisService } from "../../infrastructure/redis/IBasketRedisService";
import { BasketDto } from "../dtos/BasketDto";
import { logger } from "../../config/logger";

@injectable()
export class BasketRepository implements IBasketRepository {
 
  private _redisService: IBasketRedisService;
  private readonly BASKET_TTL = 60 * 60 * 24 * 3; // 3 day ttl in my scenario
  
  constructor(
    @inject("IBasketRedisService") redisService: IBasketRedisService
  ) {
    this._redisService = redisService;
  }

  async getBasket(key:string):Promise<BasketDto | null>{

    try {
      
    const serviceResult = await this._redisService.getCache(`basket:${key}`);


    if (!serviceResult.IsSucceed){
      
      logger.info(serviceResult.Message)

      return null;

    }

    return serviceResult.Data as BasketDto;

    } catch (error) {

      logger.error("'BasketRepository - getBasket' error ...",error)
      
      return null;
    }
  };

  async saveBasket(basket:BasketDto,ttl:number=this.BASKET_TTL):Promise<void>{
    
    try {

      const serviceResult= await this._redisService.setCache(`basket:${basket.userId}`,basket,ttl);

      if (!serviceResult.IsSucceed){
        logger.error(serviceResult.Message)
        return;
      }

      return serviceResult.Message;

    } catch (error) {

      logger.error("[BasketRepository - saveBasket] error ...",error)
      return;

    }
  };

  async deleteBasket(key:string):Promise<void>{
      try {
        
        const serviceResult=await this._redisService.deleteCache(`basket:${key}`);

        if (!serviceResult.IsSucceed) {
          logger.error(serviceResult.Message);
          return;
        }

        return serviceResult.Message;

      } catch (error) {
        
        logger.error("[BasketRepository - deleteBasket] error ...",error)
      return;

      }
  }

  async findBasketsByProductId(productId: string): Promise<BasketDto[]|null> {
    try {
      
      // -> Get all keys
      const keysResult = await this._redisService.getCache<string[]>('basket:*');
      
      if (!keysResult.IsSucceed || !keysResult.Data) {
        
        logger.info("No affected basket contains these products ...")
        
        return null;
      }

      const baskets: BasketDto[] = [];
      
      //-> Fetch and process each basket contains this product
      for (const key of keysResult.Data) {
        
        const basketResult = await this._redisService.getCache<BasketDto>(key);
        
        if (basketResult.IsSucceed && basketResult.Data) {
          
          // -> Check if basket contains the product
          if (basketResult.Data.basketItems.some(item => item.id === productId)) {
            baskets.push(basketResult.Data);
          }
        }
      }

      if (baskets.length === 0) {
        logger.info(`No baskets found containing product with ID: ${productId}`) 
        return null;
      }
 
      logger.info(`Successfully found ${baskets.length} baskets containing product: ${productId}`);

      return baskets;
     

    } catch (error) {
      logger.error(`Error finding baskets by productId: ${error}`);
      return null;
     
    }
  }
};
