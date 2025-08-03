import { inject, injectable } from "inversify";
import "reflect-metadata";
import { IInvoiceService } from "./IInvoiceService";
import { IInvoiceRepository } from "../repositories/IInvoiceRepository";
import { Invoice } from "../modals/InvoiceModal";
import { InvoiceDto } from "../dtos/InvoiceDto";
import { ServiceMessage } from "../types/ServiceMessage";
import { logger } from "../config/logger";

@injectable()
export class InvoiceService implements IInvoiceService {
  private readonly invoiceRepository: IInvoiceRepository;

  constructor(@inject("IInvoiceRepository") invoiceRepository: IInvoiceRepository) {
    this.invoiceRepository = invoiceRepository;
  }

  async createInvoice(invoiceDto: InvoiceDto): Promise<ServiceMessage<Invoice>> {
    // -> Desctruct from paymentDto
    const { userId, products, totalPrice } = invoiceDto;

    const invoice = new Invoice({ userId, products, totalPrice });

    try {
      const savedInvoices = await this.invoiceRepository.createInvoice(invoice);

      // -> Checking Repository Result
      if (!savedInvoices) {
        return new ServiceMessage(
          false,
          "Failed to save invoice [Error: InvoiceRepository]."
        );
      }

      return new ServiceMessage(true, "Invoice created successfully.", invoice);
    } catch (error) {
      logger.error("Error saving invoices:", error);
      return new ServiceMessage(false, "Error saving invoice.");
    }
  }

  async getInvoices(userId: string): Promise<ServiceMessage<Invoice[]>> {
    try {
      const invoices = await this.invoiceRepository.getInvoicessByUserId(userId);

      if (!invoices || invoices.length === 0) {
        return new ServiceMessage(false, "No invoices found for the given user.");
      }

      return new ServiceMessage(true, "Invoices retrieved successfully.", invoices);
    } catch (error) {
      logger.error("Error retrieving invoices:", error);
      return new ServiceMessage(false, "Error retrieving invoices.");
    }
  };
}
