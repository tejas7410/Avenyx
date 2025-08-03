import { Payment } from "../models/PaymentModel";

export interface IPaymentRepository{

    createPayment(payment:Payment): Promise<any>;
    
}