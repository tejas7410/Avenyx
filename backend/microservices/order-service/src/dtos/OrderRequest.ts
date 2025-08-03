import { Product } from "../modals/OrderModal";

export class OrderRequest {
  userId: string;
  products: Product[];
  totalPrice: number;

  constructor(userId: string, products: Product[], totalPrice: number) {
    this.userId = userId;
    this.products = products;
    this.totalPrice = totalPrice;
  }
}
