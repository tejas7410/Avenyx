// -> I m managing my service communication with this 'ServiseMessage' I defined generic

export class ServiceMessage<T=undefined> {
    public readonly Data?: T;
  
    // -> I created overload service message cause possible returning data ops
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