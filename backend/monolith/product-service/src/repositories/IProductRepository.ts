import { FilterQuery } from "mongoose";
import { Product } from "../models/ProductModel";

// -> This is layer between service and dbcontext in my pattern

export interface IProductRepository {
  
  create(product: Product): Promise<Product|null>;

  findById(productId: string): Promise<Product | null>;
  
  findAll(filter: FilterQuery<Product>, options?: {
    skip?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }): Promise<Product[]>;
  
  update(productId: string, product: Partial<Product>): Promise<Product | null>;
  
  delete(productId: string): Promise<void>;

  count(filter: FilterQuery<Product>): Promise<number>;
  
}