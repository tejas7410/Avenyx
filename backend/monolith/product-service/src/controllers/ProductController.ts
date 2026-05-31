import { inject, injectable } from "inversify";
import { IProductService } from "../services/IProductService";
import { Request, Response } from "express";
import { CreateProductRequest } from "../dtos/CreateProductRequest";
import { validate } from "class-validator";
import { CreateProductDTO } from "../dtos/CreateProductDto";
import { logger } from "../../../config/logger";
import { JwtPayload } from "jsonwebtoken";

@injectable()
export class ProductController {
  private _productService: IProductService;

  constructor(@inject("IProductService") productService: IProductService) {
    this._productService = productService;
  }

  private async verifyProductOwnership(
    productId: string,
    sellerId: string,
    res: Response
  ) {
    const existing = await this._productService.getById(productId);
    if (!existing.IsSucceed || !existing.Data) {
      res.status(404).json({ message: "Product not found" });
      return false;
    }

    if (existing.Data.sellerId && existing.Data.sellerId !== sellerId) {
      res.status(403).json({ message: "You can only manage your own products" });
      return false;
    }

    return true;
  }

  // *********** GET: getAll ***********
  async getAll(req: Request, res: Response) {
    try {

      // Get pagination parameters from query with defaults
      const page = parseInt(req.query.page as string) || 1;

      const limit = parseInt(req.query.limit as string) || 10;

      const serviceResult = await this._productService.getAll(page, limit);

      // If pagination is not requested (page and limit are not provided in the query)
    if (!req.query.page && !req.query.limit) {
      // Check if there was any pagination data or not
      if (serviceResult.Data && Array.isArray(serviceResult.Data)) {
        // Return the list of products without pagination
        return res.status(200).json(serviceResult.Data);
      }
    }

      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult.Message });
      }

      return res.status(200).json(serviceResult.Data);
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  // *********** GET: getById ***********
  async getById(req: Request, res: Response) {
    try {
      const serviceResult = await this._productService.getById(String(req.params.id));
      if (!serviceResult?.IsSucceed) {
        return res.status(400).json({ message: serviceResult?.Message });
      }
      return res.status(200).json(serviceResult.Data);
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  async getMyProducts(req: Request, res: Response) {
    try {
      const sellerId = (req.user as JwtPayload).id;
      const serviceResult = await this._productService.getBySeller(sellerId);

      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult.Message });
      }

      return res.status(200).json({ products: serviceResult.Data });
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  // *********** POST: Create ***********
  async create(req: Request, res: Response) {
    const sellerId = (req.user as JwtPayload).id;
    const { name, category, description, price, stock } = req.body;
    const imagePath = req.file?.path as string | undefined;

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Invalid price value" });
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: "Invalid stock value" });
    }

    const createProductRequest = new CreateProductRequest(
      name,
      category,
      description,
      parsedPrice,
      parsedStock,
      req.file
    );
    const errors = await validate(createProductRequest);
    if (errors.length > 0) {
      const messages = errors.flatMap((error) =>
        error.constraints ? Object.values(error.constraints) : []
      );
      return res.status(400).json({
        message: messages.join(", ") || "Validation failed",
        errors,
      });
    }

    // -> Creating DTO object from request object above for sending service
    try {
      const createProductDTO = new CreateProductDTO(
        name,
        description,
        category,
        parsedPrice,
        parsedStock,
        imagePath,
        sellerId
      );

      // -> Sending service and getting service result as object I defined in ../../types
      const serviceResult = await this._productService.create(createProductDTO);

      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult.Message });
      }

      return res.status(200).json({
        message: serviceResult.Message,
        data: serviceResult.Data,
      });
      
    } catch (error) {
      logger.error("Error while creating product in product controller ...");
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  // // ▼ 2-Validate the incoming request and handle errors with using class-validator ▼
  // const errors = await validate(createProductRequest);
  // if (errors.length > 0) {
  //   return res.status(400).json({ message: "Validation failed", errors });
  // }

  // ▼ 3-Map the validated request to a DTO (for service) ▼
  // const { name, description, category, image, price, stock } = createProductRequest;

  // // ▼ 4-Calling service and sending DTO ▼
  // try {
  //   const serviceResult = await this._productService.create(createProductDTO);
  //   if (!serviceResult.IsSucceed) {
  //     return res.status(400).json({ message: serviceResult.Message });
  //   }
  //   return res
  //     .status(200)
  //     .json({ message: serviceResult.Message, data: serviceResult.Data });
  // } catch (error) {
  //   return res.status(500).json({ message: "Server-side error", error });
  // }

  // *********** PUT: Update ***********
  async update(req: Request, res: Response) {
    try {
      const productId = String(req.params.id);
      const sellerId = (req.user as JwtPayload).id;
      const productUpdates = req.body;

      const canManage = await this.verifyProductOwnership(
        productId,
        sellerId,
        res
      );
      if (!canManage) return;

      const serviceResult = await this._productService.update(
        productId,
        productUpdates
      );

      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult.Message });
      }

      return res
        .status(200)
        .json({ message: serviceResult.Message, data: serviceResult.Data });
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  // *********** POST: Delete ***********
  async delete(req: Request, res: Response) {
    try {
      const productId = String(req.params.id);
      const sellerId = (req.user as JwtPayload).id;

      const canManage = await this.verifyProductOwnership(
        productId,
        sellerId,
        res
      );
      if (!canManage) return;

      const serviceResult = await this._productService.delete(productId, false);

      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult.Message });
      }

      return res.status(200).json({ message: serviceResult.Message });
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }
}
