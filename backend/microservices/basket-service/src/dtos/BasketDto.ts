// -> Created for sending infos to service(my business logic) from controller.

import { BasketItemDto } from "./BasketItemDto";

  export class BasketDto {
    userId: string;
    basketItems: BasketItemDto[];
    totalPrice: number; 
    createdAt: Date;
    updateAt: Date;
  
    constructor(
      userId: string,
      basketItems: BasketItemDto[],
      totalPrice: number,
      createdAt: Date,
      updateAt: Date
    ) {
      this.userId = userId;
      this.basketItems = basketItems;
      this.totalPrice = totalPrice;
      this.createdAt = createdAt;
      this.updateAt = updateAt;
    }
  
    calculateTotalPrice(): number {
      return this.basketItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }
  }
  