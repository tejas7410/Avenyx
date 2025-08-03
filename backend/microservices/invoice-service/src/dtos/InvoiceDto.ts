import { Product } from "../modals/InvoiceModal";

export class InvoiceDto {
  userId: string;
  paymentId: string;
  products: Product[];
  totalPrice: number;

  constructor(userId: string, paymentId:string, products: Product[], totalPrice: number) {
    this.userId = userId;
    this.products = products;
    this.totalPrice = totalPrice;
    this.paymentId = paymentId;
  }
}
