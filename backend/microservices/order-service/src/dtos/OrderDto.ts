import { Product } from "../modals/OrderModal";

export class OrderDto {
  userId: string;
  paymentId: string;
  products: Product[];
  totalPrice: number;

  constructor(userId: string,paymentId: string, products: Product[], totalPrice: number) {
    this.userId = userId;
    this.paymentId = paymentId;
    this.products = products;
    this.totalPrice = totalPrice;
  }
}
