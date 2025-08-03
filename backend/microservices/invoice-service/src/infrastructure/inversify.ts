// **************** This is my container for my dependency injections with 'inversify' ****************

import { Container } from "inversify";
import { InvoiceService } from "../services/InvoiceService";
import { IInvoiceService } from "../services/IInvoiceService";
import { InvoiceRepository } from "../repositories/InvoiceRepository";
import { IInvoiceRepository } from "../repositories/IInvoiceRepository";
import { InvoiceController } from "../controllers/InvoiceController";

const container = new Container();

// ▼ My dependency injection settings here ▼

container.bind<(IInvoiceRepository)>("IInvoiceRepository").to(InvoiceRepository);

container.bind<(IInvoiceService)>("IInvoiceService").to(InvoiceService);

container.bind<InvoiceController>(InvoiceController).toSelf();


export { container };