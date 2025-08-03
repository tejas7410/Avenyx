// **************** Basket Controller (Getbasket, Add, Deletebasket, Deletebasketitem) ****************

import { inject, injectable } from "inversify";
import { IBasketService } from "../services/IBasketService";
import { BasketRequest } from "../dtos/BasketRequest";
import { validate } from "class-validator";
import { Request, Response } from "express";
import { logger } from "../../config/logger";
import { IWebSocketService } from "../services/IWebSocketService";

@injectable()
export class BasketController {
  private _basketService: IBasketService;
  private _webSocketService: IWebSocketService;

  constructor(@inject("IBasketService") basketService: IBasketService,
  @inject("IWebSocketService")  webSocketService: IWebSocketService) {
    this._basketService = basketService;
    this._webSocketService = webSocketService;
  }

  async getBasket(req: Request, res: Response) {

    const basketId = req.params.id;
    
    try {
      const serviceResult = await this._basketService.getBasket(basketId);

      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult?.Message });
      }

      return res.status(200).json(serviceResult.Data);
    } catch (error:any) {
      logger.error("[BasketController - getBasket]", error,{ stack: error.stack });
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  async addToBasket(req: Request, res: Response) {
    
    // -> Destruct and validate operations from req body and basketrequest dto
    const { userId, productId,productName, quantity } = req.body;
    const basketRequest = new BasketRequest(userId, productId,productName, quantity);

    const errors = await validate(basketRequest);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    try {
      
      const serviceResult = await this._basketService.saveBasket(basketRequest);

      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult?.Message });
      }

      // -> Broadcast basket update to all clients
      this._webSocketService.broadcastBasketUpdate(userId, {
        action: 'add',
        productId,
        basket: serviceResult.Data
      });

      return res.status(200).json(serviceResult.Data);

    } catch (error:any) {
      logger.error("[BasketController - addToBasket]", error,{ stack: error.stack });
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  async deleteBasket(req: Request, res: Response) {
    const userId  = req.params.id;
  
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    try {
      // -> Call the service to delete the basket
      const serviceResult = await this._basketService.deleteBasket(userId);
  
      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult?.Message });
      }
  
      return res.status(200).json({ message: "Basket deleted successfully" });
  
    } catch (error: any) {
      logger.error("[BasketController - deleteBasket]", error, { stack: error.stack });
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  async deleteProductFromBasket(req: Request, res: Response) {
    
    const { userId, productId } = req.body;
  
    try {
      const serviceResult = await this._basketService.removeProductFromBasket(userId, productId);
  
      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult?.Message });
      }
  
      return res.status(200).json(serviceResult.Data);
    } catch (error: any) {
      logger.error("[BasketController - deleteProductFromBasket]", error, { stack: error.stack });
      return res.status(500).json({ message: "Server-side error", error });
    }
  }
}
