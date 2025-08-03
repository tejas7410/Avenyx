import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { IPaymentService } from "../services/IPaymentService";
import { PaymentDto } from "../dtos/PaymentDto";
import { logger } from "../config/logger";

@injectable()
export class PaymentController {
  private _paymentService: IPaymentService;

  constructor(@inject("IPaymentService") paymentService: IPaymentService) {
    this._paymentService = paymentService;
  }

  async createPayment(req: Request, res: Response) {

    try {

  
      // 1: Destructure Request Body
      const { userId, products, cardNo, totalAmount } = req.body;


      // Step 2: Validate Input
      if (
        !userId ||
        !products ||
        !cardNo
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Ensure all fields are provided and valid.",
        });
      }

      // Step 3: Create Payment DTO
      const paymentDto = new PaymentDto(userId, products, cardNo, totalAmount);

      // Step 4: Call Service with DTO I define above
      const serviceResult = await this._paymentService.createPayment(
        paymentDto
      );

      // Step 5: Return Response
      if (serviceResult.IsSucceed) {
        return res.status(201).json({
          success: true,
          message: serviceResult.Message,
          data: serviceResult.Data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: serviceResult.message,
        });
      }

    } catch (error) {
      logger.error("[PaymentController] Error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing the payment.",
        error: error
      });
    }
  }
}
