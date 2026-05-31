import { Router } from "express";
import { container } from "../../../config/inversify";
import { ProductController } from "../controllers/ProductController";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { upload } from "../middlewares/multerMiddleware";
import { authenticateToken } from "../../../identity-service/src/middlewares/authMiddleware";
import { requireRole } from "../../../identity-service/src/middlewares/roleMiddleware";

const ProductRouter = Router();

const productController = container.get(ProductController);

ProductRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    await productController.getAll(req, res);
  })
);

ProductRouter.get(
  "/seller/me",
  authenticateToken,
  requireRole("seller"),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.getMyProducts(req, res);
  })
);

ProductRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await productController.getById(req, res);
  })
);

ProductRouter.post(
  "/",
  authenticateToken,
  requireRole("seller"),
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.create(req, res);
  })
);

ProductRouter.put(
  "/:id",
  authenticateToken,
  requireRole("seller"),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.update(req, res);
  })
);

ProductRouter.delete(
  "/:id",
  authenticateToken,
  requireRole("seller"),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.delete(req, res);
  })
);

export default ProductRouter;
