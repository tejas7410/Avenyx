import { Invoice } from "../modals/InvoiceModal";

export interface IInvoiceRepository{



    createInvoice(invoice:Invoice) : Promise<Invoice | null>;

    getInvoicessByUserId(userId: string): Promise<Invoice[] | null>;

    
}