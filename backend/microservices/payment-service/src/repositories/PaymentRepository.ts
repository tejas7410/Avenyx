import { injectable } from "inversify";
import { IPaymentRepository } from "./IPaymentRepository";
import { Payment } from "../models/PaymentModel";
import { logger } from "../config/logger";

@injectable()
export class PaymentRepository implements IPaymentRepository {
  async createPayment(payment: Payment): Promise<any> {
    try {
        // -> Save payment to the database using the Payment model coming from service
      const savedPayment = await new Payment(payment).save();
      
      return savedPayment;

    } catch (error) {

      logger.error("Error saving payment [PaymentRepository]:", error);
    }
  }
}
