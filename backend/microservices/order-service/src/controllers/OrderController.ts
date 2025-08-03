import { inject, injectable } from "inversify";
import { IOrderService } from "../services/IOrderService";
import { Request, Response } from "express";
import { OrderDto } from "../dtos/OrderDto";
import { logger } from "../config/logger";

@injectable()
export class OrderController {
  private _orderService: IOrderService;

  constructor(@inject("IOrderService") orderService: IOrderService) {
    this._orderService = orderService;
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { userId,paymentId, products, totalPrice } = req.body;

      // Validate input
      if (!userId || !products || !totalPrice) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Ensure all fields are provided and valid.",
        });
      }

      // Create OrderDto instance
      const orderDto = new OrderDto(userId,paymentId, products, totalPrice);

      // Call the service to create the order
      const serviceResult = await this._orderService.createOrder(orderDto);

      // Check service result and return appropriate response
      if (!serviceResult.IsSucceed) {
        return res.status(500).json({
          success: false,
          message: serviceResult.Message,
        });
      }

      return res.status(200).json({
        success: true,
        message: serviceResult.Message,
        data: serviceResult.Data,
      });
    } catch (error) {
      logger.error("Error creating order:", error);

      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the order.",
      });
    }
  }

  async getOrders(req: Request, res: Response) {
    
    const userId = req.params.id;

    const serviceResult = await this._orderService.getOrders(userId);

    if (!serviceResult.IsSucceed) {
      return res.status(400).json({ message: serviceResult.Message });
    }

    return res.status(200).json({
      message: serviceResult.Message,
      data: serviceResult.Data,
    });
  }
}
