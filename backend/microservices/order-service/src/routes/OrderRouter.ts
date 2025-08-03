import { Router } from "express";
import { container } from "../infrastructure/inversify";
import { OrderController } from "../controllers/OrderController";
import { asyncHandler } from "../middlewares/asyncHandler";
import  { Request, Response } from "express";

const OrderRouter = Router();

const orderController=container.get(OrderController);

// -> Routes
OrderRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    await orderController.createOrder(req, res);
  })
);

OrderRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await orderController.getOrders(req, res);
  })
);


  export { OrderRouter };