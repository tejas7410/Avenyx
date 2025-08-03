export interface PaymentEvent {
    status: 'SUCCESS' | 'FAILED';
    paymentId: string;
    userId: string;
    products: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
  }