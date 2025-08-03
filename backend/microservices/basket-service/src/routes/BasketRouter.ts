import { Router } from "express";
import { container } from "../../config/inversify";
import { BasketController } from "../controllers/BasketController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Request, Response, RequestHandler  } from "express";

const BasketRouter = Router();

const basketController = container.get(BasketController);

// -> Routes
BasketRouter.get("/:id", asyncHandler(async (req: Request, res: Response) => {
    await basketController.getBasket(req, res);
  }));

BasketRouter.post("/", asyncHandler(async (req: Request, res: Response) => {
    await basketController.addToBasket(req, res);
  }));

  BasketRouter.delete("/:id", asyncHandler(async (req: Request, res: Response) => {
    await basketController.deleteBasket(req, res);
  }));

  BasketRouter.delete("/delete/item", asyncHandler(async (req: Request, res: Response) => {
    await basketController.deleteProductFromBasket(req, res);
  }));

export { BasketRouter };
