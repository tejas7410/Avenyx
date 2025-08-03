export interface PaymentEvent {
    status: 'SUCCESS' | 'FAILED';
    paymentId: string;
    userId: string;
    products: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalPrice: number;
  }