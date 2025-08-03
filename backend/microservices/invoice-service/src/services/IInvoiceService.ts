import { InvoiceDto } from "../dtos/InvoiceDto";
import { Invoice } from "../modals/InvoiceModal";
import { ServiceMessage } from "../types/ServiceMessage";

export interface IInvoiceService {
  createInvoice(invoiceDto: InvoiceDto): Promise<ServiceMessage<Invoice>>;
  getInvoices(userId: string): Promise<ServiceMessage<Invoice[]>>;
}
