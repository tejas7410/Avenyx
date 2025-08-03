// -> I m managing my service communication with this 'ServiseMessage' I defined generic

export class ServiceMessage<T = undefined> {
  public readonly Data?: T;

  public readonly IsSucceed: boolean;
  public readonly Message: any;

  // -> Constructor overloads for different possibilities ( With only message and bool, with generic data )
  constructor(isSucceed: boolean, message: any);
  constructor(isSucceed: boolean, message: any, data: T);

  constructor(isSucceed: boolean, message: any, data?: T) {
    this.IsSucceed = isSucceed;
    this.Message = message;

    if (data !== undefined) {
      this.Data = data;
    }
  }
}
