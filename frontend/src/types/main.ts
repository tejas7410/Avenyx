import { Key } from "react";

export interface Product {
    _id: Key | null | undefined;
    id: number;
    sellerId?: string;
    name: string;
    category: string;
    price: number;
    stock?: number;
    description: string;
    image: {
      public_id: string;
      url: string;
    };
  }

  export interface Pagination {
    total: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  }
  
  export interface ApiResponse {
    products: Product[];
    pagination: Pagination;  // Add pagination here
  }
