export interface PaymentEvent {
    paymentId: string;
    userId: string;
    products: string[];
    status: 'SUCCESS'; // -> In my scenario I just produce success event for now
    totalPrice: number;
    timestamp: Date;
  }