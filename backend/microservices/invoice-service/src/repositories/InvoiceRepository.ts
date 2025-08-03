import { injectable } from "inversify";
import { IInvoiceRepository } from "./IInvoiceRepository";
import { Invoice } from "../modals/InvoiceModal";
import { logger } from "../config/logger";


@injectable()
export class InvoiceRepository implements IInvoiceRepository{

    async createInvoice(invoice:Invoice) : Promise<Invoice | null> {
        try {
            const newInvoice=new Invoice(invoice);
            await newInvoice.save();
            return invoice;
        } catch (error) {
            logger.error("Error creating invoice:", error);
            return null;
        }
    }

    async getInvoicessByUserId(userId: string): Promise<Invoice[] | null> {
        try {
            
          const invoices = await Invoice.find({ userId, isDeleted: false });
       
          return invoices;
        } catch (error) {
          logger.error("Error getting invoices by userId [InvoiceRepository]:", error);
          return null;
        }
      }
}