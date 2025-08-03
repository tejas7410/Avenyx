import { PaymentDto } from "../dtos/PaymentDto";


export interface IPaymentService{

    createPayment(paymentDto:PaymentDto): Promise<any>;
}