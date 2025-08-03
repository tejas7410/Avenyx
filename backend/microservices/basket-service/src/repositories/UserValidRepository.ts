import { IBasketRedisService } from "../../infrastructure/redis/IBasketRedisService";
import { inject, injectable } from "inversify";
import { logger } from "../../config/logger";
import { IUserValidRepository } from "./IUserValidRepository";
import { UserValidDto } from "../dtos/UserValidDto";

@injectable()
export class UserValidRepository implements IUserValidRepository {
 
  private _redisService: IBasketRedisService;
  private readonly USER_VALID_TTL = 60 * 60 * 24 * 3; // 3 day ttl in my scenario
  
  constructor(
    @inject("IBasketRedisService") redisService: IBasketRedisService
  ) {
    this._redisService = redisService;
  }

  async getUserValid(key:string):Promise<boolean | null>{


    try {

    const serviceResult = await this._redisService.getCache(key);

    if (!serviceResult.IsSucceed){
      
      logger.error(serviceResult.Message)

      return null;

    }

    return true;

    } catch (error) {

      logger.error("[UserValidRepository - getUserValid] error ...",error)
      
      return null;
    }
  };

  async saveUserValid(userValid:UserValidDto,ttl:number=this.USER_VALID_TTL):Promise<void>{
    
    try {

      const serviceResult= await this._redisService.setCache(userValid.id,userValid.isAvailable,ttl);

      if (!serviceResult.IsSucceed){
        logger.error(serviceResult.Message)
        return;
      }

      return serviceResult.Message;

    } catch (error) {

      logger.error("[UserValidRepository - saveUserValid] error ...",error)
      return;

    }
  };

  async deleteUserValid(key:string):Promise<void>{
      try {
        
        const serviceResult=await this._redisService.deleteCache(key);

        if (!serviceResult.IsSucceed) {
          logger.error(serviceResult.Message);
          return;
        }

        return serviceResult.Message;

      } catch (error) {
        
        logger.error("[UserValidRepository - deleteUserValid] error ...",error)
      return;

      }
  }
};