import { Router } from "express";
import { container } from "../config/inversify";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Request, Response, RequestHandler } from "express";
import { PaymentController } from "../controllers/PaymentController";

const PaymentRouter = Router();

const paymentController = container.get(PaymentController);

// -> Routes
PaymentRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    await paymentController.createPayment(req, res);
  })
);

export { PaymentRouter };
