import { Router } from "express";
import { container } from "../../../config/inversify";
import { ProductController } from "../controllers/ProductController";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { upload } from "../middlewares/multerMiddleware";

const ProductRouter = Router();

const productController = container.get(ProductController);
;

// -> Get all products
ProductRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    await productController.getAll(req, res);
  })
);

// -> Get product by ID
ProductRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await productController.getById(req, res);
  })
);

// -> Create a new product
ProductRouter.post(
  "/",upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    await productController.create(req, res);
  })
);

// -> Update an existing product
ProductRouter.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await productController.update(req, res);
  })
);

// -> Delete a product
ProductRouter.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await productController.delete(req, res);
  })
);

export default ProductRouter;
