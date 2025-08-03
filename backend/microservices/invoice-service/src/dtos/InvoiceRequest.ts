import { Product } from "../modals/InvoiceModal";

export class InvoiceRequest {
  userId: string;
  products: Product[];
  totalPrice: number;

  constructor(userId: string, products: Product[], totalPrice: number) {
    this.userId = userId;
    this.products = products;
    this.totalPrice = totalPrice;
  }
}
