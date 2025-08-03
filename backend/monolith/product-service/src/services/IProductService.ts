import { CreateProductDTO } from "../dtos/CreateProductDto";
import { Product } from "../models/ProductModel";
import { PaginationResponse, ServiceMessage } from "../types/ServiceMessage";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

export interface IProductService {
  create(productDto: CreateProductDTO): Promise<ServiceMessage<Product>>;
  getAll(page: number, limit: number): Promise<ServiceMessage<Product | Product[] | PaginationResponse<Product> | null>>;
  getById(id: string): Promise<ServiceMessage<Product | null>>;
  update(
    id: string,
    product: Partial<Product>
  ): Promise<ServiceMessage<Product>>;
  delete(
    id: string,
    hardDelete: boolean
  ): Promise<ServiceMessage>;
}
