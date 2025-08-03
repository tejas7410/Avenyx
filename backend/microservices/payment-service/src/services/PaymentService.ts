import { PaymentServiceKafka } from "../config/kafka";
import { logger } from "../config/logger";
import { PaymentDto } from "../dtos/PaymentDto";
import { Payment } from "../models/PaymentModel";
import { IPaymentRepository } from "../repositories/IPaymentRepository";
import { ServiceMessage } from "../types/ServiceMessage";
import { IPaymentService } from "./IPaymentService";
import { inject, injectable } from "inversify";
import { PaymentEvent } from "../types/PaymentEvent";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

@injectable()
export class PaymentService implements IPaymentService {
  private _paymentRepository: IPaymentRepository;
  private _paymentKafkaService: PaymentServiceKafka;

  constructor(
    @inject("IPaymentRepository") paymentRepository: IPaymentRepository,
    @inject("PaymentServiceKafka") paymentKafkaService: PaymentServiceKafka
  ) {
    this._paymentRepository = paymentRepository;
    this._paymentKafkaService = paymentKafkaService;
  }

  async createPayment(
    paymentDto: PaymentDto
  ): Promise<ServiceMessage<Payment>> {
    
    // -> Desctruct from paymentDto
    const { userId, cardNo, products, totalAmount } = paymentDto;

    // -> Consider and assume checking card details for payment and succesfull
    if (!cardNo || cardNo.length < 12) {
      return new ServiceMessage(false, "Invalid card number.");
    }

    // -> Create a new Payment document
    const payment = new Payment({
      userId,
      paymentMethod: "card", // -> In my scenario card for now
      totalAmount,
    });

    // -> Save to database
    try {
      const savedPayment = await this._paymentRepository.createPayment(payment);

      // -> Checking Repository Result
      if (!savedPayment) {
        return new ServiceMessage(
          false,
          "Failed to save payment [Error: PaymentRepository]."
        );
      }

      try {
       
        // ************ Kafka Producer Operations ************
        const paymentEvent: PaymentEvent = {
          userId: userId,
          paymentId: savedPayment._id,
          products: products,
          status: "SUCCESS",
          totalPrice: totalAmount,
          timestamp: new Date(),
        };

        await this._paymentKafkaService.sendPaymentEvent(paymentEvent);
      } catch (error) {
        logger.error(
          "Failed to send payment event [PaymentService-Kafka]:",
          error
        );
      }

      return new ServiceMessage(true, "Payment created successfully.", payment);
    } catch (error) {
      logger.error("Error saving payment:", error);
      return new ServiceMessage(false, "Error saving payment.");
    }
  }
}
