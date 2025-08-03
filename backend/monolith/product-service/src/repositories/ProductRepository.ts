// ************ Database -> Repository -> Service -> Controller **********

import { IProductRepository } from "./IProductRepository";
import { Product } from "../models/ProductModel";
import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { logger } from "../../../config/logger";

// -> This is layer between service and dbcontext in my pattern

@injectable()
export class ProductRepository implements IProductRepository {

  async create(product: Product): Promise<Product|null> {
    try {
      const newProduct = new Product(product);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      return null;
    }
  }

  async findById(productId: string): Promise<Product | null> {
    try {
      const product = await Product.findById(productId);
      return product;
    } catch (error) {
      logger.error("Error finding product by id:", error);
      return null;
    }
  }

  async findAll(filter: FilterQuery<Product>, options?: {
    skip?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }): Promise<Product[]> {
    try {
      const query = Product.find(filter);

      if (options?.skip) query.skip(options.skip);
      if (options?.limit) query.limit(options.limit);
      if (options?.sort) query.sort(options.sort);

      return await query.exec();
    } catch (error) {
      logger.error("[ProductRepository - findAll] : ", error);
      throw error;
    }
  }

  async update(
    productId: string,
    product: Partial<Product>
  ): Promise<Product | null> {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        product,
        {
          new: true,
        }
      );

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Unable to update product");
    }
  }

  async delete(productId: string, hardDelete: boolean = false): Promise<void> {
    try {
      const product = await Product.findById(productId);
      if (product) {
        if (hardDelete) {
          await Product.findByIdAndDelete(productId);
        } else {
          product.isDeleted = true;
          product.deletedAt = new Date();
          await product.save();
        }
      } else {
        console.error("Product not found");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  async count(filter: FilterQuery<Product>): Promise<number> {
    try {
      return await Product.countDocuments(filter);
    } catch (error) {
      logger.error("[ProductRepository - count] : ", error);
      throw error;
    }
  }
}
