// ************ Database -> Repository -> Service -> Controller **********

import { inject } from "inversify";
import { Product } from "../models/ProductModel";
import { IProductRepository } from "../repositories/IProductRepository";
import { ServiceMessage } from "../types/ServiceMessage";
import { IProductService } from "./IProductService";
import { CreateProductDTO } from "../dtos/CreateProductDto";
import { IProductRedisService } from "../../infrastructure/redis/IProductRedisService";
import cloudinary from "../../../config/cloudinary";
import { logger } from "../../../config/logger";
import { ProductEventPublisher } from "../../infrastructure/kafka/ProductEventPublisher";
import { PaginationResponse } from "../types/PaginationResponse";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

export class ProductService implements IProductService {
  private _productRepository: IProductRepository;
  private _productRedisService: IProductRedisService;
  private _eventPublisher: ProductEventPublisher;

  constructor(
    @inject("IProductRepository") productRepository: IProductRepository,
    @inject("IProductRedisService") productRedisService: IProductRedisService,
    @inject("ProductEventPublisher") productEventPublisher: ProductEventPublisher
  ) {
    this._productRepository = productRepository;
    this._productRedisService = productRedisService;
    this._eventPublisher = productEventPublisher;
  }

  async create(productDto: CreateProductDTO): Promise<ServiceMessage<Product>> {
    // -> Desctruction DTO and check exist in database or not
    // -> In my scenario every product has unique name
    const { name, description, category, price, stock, imagePath } = productDto;

    const existingProduct = await this._productRepository.findAll({ name });

    if (existingProduct.length > 0) {
      return new ServiceMessage(
        false,
        `Sorry, the product with name ${name} already exists.`
      );
    }

    try {
      // -> Cloudinary upload which returns public id and url
      const cloudinaryUpload = await cloudinary.uploader.upload(imagePath, {
        folder: "products",
      });
      if (!cloudinaryUpload) {
        logger.error(
          "There is a error in cloudinary upload process in 'Product Service'"
        );
      }

      // -> Creating model from DTO and clodinary image infos
      const newProduct = new Product({
        name,
        description,
        category,
        image: {
          public_id: cloudinaryUpload.public_id,
          url: cloudinaryUpload.secure_url,
        },
        price,
        stock,
        isDeleted: false,
        deletedAt: null,
      });

      // -> Send to repository for saving new product and publish event in Kafka with PublishEventer
      try {
        const savedProduct = await this._productRepository.create(newProduct); // Save to DB

        if (!savedProduct) {
          return new ServiceMessage(false, "Error while saving product.");
        }

        // -> Publish event in Kafka with PublishEventer
        try {
          await this._eventPublisher.publishProductEvent({
            productId: savedProduct._id.toString(),
            name: savedProduct.name,
            price: savedProduct.price,
            stock: savedProduct.stock,
            imageUrl: savedProduct.image.url,
            eventType: "PRODUCT_CREATED",
          });
        } catch (eventError) {
          logger.error(
            `[Error at: ProductService - create - publishProductEvent()] , ${eventError}`
          );
        }
      } catch (dbError) {
        logger.error(
          `[Error at: ProductService - repository.create()] , ${dbError}`
        );
      }

      // -> Cause products changed I need to delete and update redis cache
      try {
        
        await this._productRedisService.invalidateAllProductCache();

        await this._productRedisService.cacheProduct(
          String(newProduct._id),
          newProduct
        );
      } catch (error) {
        logger.error(
          "[ProductService - 'create/invalidatecache-cacheproduct'], ",
          error
        );
      }

      return new ServiceMessage(
        true,
        `Product with name ${name} added successfully.`,
        newProduct
      );
    } catch (error) {
      logger.error("[ProductService - create");
      return new ServiceMessage(
        false,
        `Error while adding new product: ${error}`
      );
    }
  }

  // -> I will use infinite scroll in my frontend
  async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<
    ServiceMessage<Product | Product[] | PaginationResponse<Product> | null>
  > {
    try {

      if (!page || !limit) {

        const products = await this._productRepository.findAll({}, { sort: { createdAt: -1 } });
        if (!products || products.length === 0) {
          return new ServiceMessage(false, "No products found.");
        }
        return new ServiceMessage(true, "Successful", products);
      }

      const cacheKey = `all_page${page}_limit${limit}`;

      // -> Trying to get from redis if there is not cache with key 'all'
      const cachedProducts = await this._productRedisService.getCachedProduct(
        cacheKey
      );

      if (cachedProducts) {
        return new ServiceMessage(true, "Fetched from cache.", cachedProducts);
      }

      // -> Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // -> Get total count for pagination info
      const totalCount = await this._productRepository.count({});

      // -> Get paginated products
      const products = await this._productRepository.findAll(
        {},
        {
          skip,
          limit,
          sort: { createdAt: -1 },
        }
      );

      if (!products || products.length === 0) {
        return new ServiceMessage(false, "No products found.");
      }

      // -> Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      // -> Create pagination response
      const paginatedResponse: PaginationResponse<Product> = {
        products: products,
        pagination: {
          total: totalCount,
          currentPage: page,
          totalPages,
          hasMore,
        },
      };

      await this._productRedisService.cacheProduct(cacheKey, paginatedResponse);

      return new ServiceMessage(true, "Successful", paginatedResponse);
    } catch (error) {
      logger.error("[ProductService - getAll] : ", error);

      return new ServiceMessage(
        false,
        `There is a error while getting products from database: ${error}`
      );
    }
  }

  async getById(id: string): Promise<ServiceMessage<Product | null>> {
    try {
      // -> Try fetching from cache
      const cachedProduct = await this._productRedisService.getCachedProduct(
        id
      );

      if (cachedProduct !== null) {
        return new ServiceMessage(true, `Succesful`, cachedProduct as Product);
      }

      const dataProduct = await this._productRepository.findById(id);

      if (dataProduct !== null) {
        return new ServiceMessage(true, `Succesful`, dataProduct as Product);
      }

      return new ServiceMessage(false, `There is no product with that ${id}`);
    } catch (error) {
      logger.error("Error in [ProductService - getById ] :", error);
      return new ServiceMessage(
        false,
        `Error fetching product by ID: ${error}`
      );
    }
  }

  async update(
    id: string,
    product: Partial<Product>
  ): Promise<ServiceMessage<Product>> {
    try {
      const updatedProduct = await this._productRepository.update(id, product);

      if (!updatedProduct) {
        return new ServiceMessage(false, "No product found to update.");
      }

      // -> Publish update event to kafka
      try {
        await this._eventPublisher.publishProductEvent({
          productId: updatedProduct._id.toString(),
          name: updatedProduct.name,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          imageUrl: updatedProduct.image.url,
          eventType: "PRODUCT_UPDATED",
        });
      } catch (error) {
        logger.error(
          `[Error at: ProductService - update - publishProductEvent()] , ${error}`
        );
      }

      // -> Update cache
      await this._productRedisService.cacheProduct(id, updatedProduct);

      await this._productRedisService.invalidateCache("all");

      return new ServiceMessage(
        true,
        "Product updated successfully.",
        updatedProduct
      );
    } catch (error) {
      logger.error("Error in [ProductService - update ] :", error);
      return new ServiceMessage(false, `Error updating product: ${error}`);
    }
  }

  async delete(
    id: string,
    hardDelete: boolean = false
  ): Promise<ServiceMessage> {
    try {
      const product = await this._productRepository.findById(id);

      if (!product) {
        return new ServiceMessage(false, "No product found to delete.");
      }

      await this._productRepository.delete(id);

      // -> Publish delete event to kafka
      try {
        await this._eventPublisher.publishProductEvent({
          productId: product._id.toString(),
          name: product.name,
          price: product.price,
          stock: product.stock,
          imageUrl: product.image.url,
          eventType: "PRODUCT_DELETED",
        });
      } catch (error) {
        logger.error(
          `[Error at: ProductService - delete - publishProductEvent()] , ${error}`
        );
      }

      await this._productRedisService.invalidateCache(id);

      await this._productRedisService.invalidateCache("all");

      return new ServiceMessage(true, "Product deleted successfully.");
    } catch (error) {
      logger.error("Error in [ProductService - delete ] :", error);
      return new ServiceMessage(false, `Error deleting product: ${error}`);
    }
  }
}
