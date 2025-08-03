// -> I will use infinite scroll in my frontend
export interface PaginationResponse<T> {
    products: T[];
    pagination: {
      total: number;
      currentPage: number;
      totalPages: number;
      hasMore: boolean;
    };
  }