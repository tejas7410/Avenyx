import { Router } from "express";
import { container } from "../infrastructure/inversify";
import { InvoiceController } from "../controllers/InvoiceController";
import { asyncHandler } from "../middlewares/asyncHandler";
import  { Request, Response } from "express";

const InvoiceRouter = Router();

const invoiceController=container.get(InvoiceController);

// -> Routes
InvoiceRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    await invoiceController.createInvoice(req, res);
  })
);

InvoiceRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await invoiceController.getInvoices(req, res);
  })
);


  export { InvoiceRouter };