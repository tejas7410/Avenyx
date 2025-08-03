// -> I m managing my controller-service communication with this 'ServiseMessage' I defined generic

export class ServiceMessage<T> {
  public readonly Data?: T;

  // -> I created overload service message cause I will return service message with data in some operations
  
  constructor(isSucceed: boolean, message: any);
  constructor(isSucceed: boolean, message: any, data: T);
  constructor(isSucceed: boolean, message: any, data?: T) {
    this.IsSucceed = isSucceed;
    this.Message = message;
    if (data !== undefined) {
      this.Data = data;
    }
  }

  public readonly IsSucceed: boolean;
  public readonly Message: any;
}
