import { Key } from "react";

export interface Product {
    _id: Key | null | undefined;
    id: number;
    name: string;
    price: number;
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