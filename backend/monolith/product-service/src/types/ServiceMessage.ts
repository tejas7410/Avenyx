// -> I m managing my service communication with this 'ServiseMessage' I defined generic

export class ServiceMessage<T = undefined, P = undefined> {
  public readonly Data?: T;
  public readonly Pagination?: P;

  public readonly IsSucceed: boolean;
  public readonly Message: any;

  // -> Constructor overloads for different possibilities ( With only message and bool, with generic data, with generic paginationresponse I defined below )
  
  constructor(isSucceed: boolean, message: any);
  constructor(isSucceed: boolean, message: any, data: T);
  constructor(isSucceed: boolean, message: any, data: T, pagination: P);
  
  constructor(isSucceed: boolean, message: any, data?: T, pagination?: P) {
    this.IsSucceed = isSucceed;
    this.Message = message;

    if (data !== undefined) {
      this.Data = data;
    }
    
    if (pagination !== undefined) {
      this.Pagination = pagination;
    }
  }
}

export interface PaginationResponse<T> {
  products: T[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}