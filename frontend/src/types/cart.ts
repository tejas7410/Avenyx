// ************* Managing Shopping Cart Interfaces Here *************

export interface BasketItem {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

  
export interface BasketResponse {
    userId: string;
    basketItems: BasketItem[];
    totalPrice: number;
    createdAt: string;
    updateAt: string;
  }