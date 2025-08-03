import {IBasketItemRepository} from "./IBasketItemRepository";
import { IBasketRedisService } from "../../infrastructure/redis/IBasketRedisService";
import { BasketItemDto } from "../dtos/BasketItemDto";
import { inject, injectable } from "inversify";
import { logger } from "../../config/logger";

@injectable()
export class BasketItemRepository implements IBasketItemRepository {
 
  private _redisService: IBasketRedisService;
  private readonly BASKET_ITEM_TTL = 60 * 60 * 24 * 3; // 3 day ttl in my scenario
  
  constructor(
    @inject("IBasketRedisService") redisService: IBasketRedisService
  ) {
    this._redisService = redisService;
  }

  async getBasketItem(key:string):Promise<BasketItemDto | null>{

    try {

    const serviceResult = await this._redisService.getCache(key);

    if (!serviceResult.IsSucceed){
      
      logger.error(serviceResult.Message)

      return null;

    }

    return serviceResult.Data as BasketItemDto;

    } catch (error) {

      logger.error("[BasketItemRepository - getBasketItem] error ...",error)
      
      return null;
    }
  };

  async saveBasketItem(basketItem:BasketItemDto,ttl:number=this.BASKET_ITEM_TTL):Promise<void>{
    
    try {

      const serviceResult= await this._redisService.setCache(basketItem.id,basketItem,ttl);

      if (!serviceResult.IsSucceed){
        logger.error(serviceResult.Message)
        return;
      }

      return serviceResult.Message;

    } catch (error) {

      logger.error("[BasketItemRepository - saveBasket] error ...",error)
      return;

    }
  };

  async deleteBasketItem(key:string):Promise<void>{
      try {
        
        const serviceResult=await this._redisService.deleteCache(key);

        if (!serviceResult.IsSucceed) {
          logger.error(serviceResult.Message);
          return;
        }

        return serviceResult.Message;

      } catch (error) {
        
        logger.error("[BasketItemRepository - deleteBasket] error ...",error)
      return;

      }
  }
};