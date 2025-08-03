import { inject, injectable } from "inversify";
import { IInvoiceService } from "../services/IInvoiceService";
import { Request, Response } from "express";
import { InvoiceDto } from "../dtos/InvoiceDto";
import { logger } from "../config/logger";

@injectable()
export class InvoiceController {
  private _invoiceService: IInvoiceService;

  constructor(@inject("IInvoiceService") invoiceService: IInvoiceService) {
    this._invoiceService = invoiceService;
  }

  async createInvoice(req: Request, res: Response) {
    try {
      
      const { userId,paymentId, products, totalPrice } = req.body;

      // Validate input
      if (!userId || !products || !totalPrice) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Ensure all fields are provided and valid.",
        });
      }

      // Create InvoiceDto instance
      const invoiceDto = new InvoiceDto(userId,paymentId, products, totalPrice);

      // Call the service to create the invoice
      const serviceResult = await this._invoiceService.createInvoice(invoiceDto);

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
      logger.error("Error creating invoice:", error);

      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the invoice.",
      });
    }
  }

  async getInvoices(req: Request, res: Response) {
    
    const userId = req.params.id;

    const serviceResult = await this._invoiceService.getInvoices(userId);

    if (!serviceResult.IsSucceed) {
      return res.status(400).json({ message: serviceResult.Message });
    }

    return res.status(200).json({
      message: serviceResult.Message,
      data: serviceResult.Data,
    });
  }
}
