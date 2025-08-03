// **************** Invoice Service Kafka Consumer Settings ****************

import { Consumer, Kafka } from "kafkajs";
import { logger } from "./logger";
import { IInvoiceService } from "../services/IInvoiceService";
import { inject } from "inversify";
import { PaymentEvent } from "../types/PaymentEvent";
import { InvoiceDto } from "../dtos/InvoiceDto";

export class InvoiceServiceKafka {
  private consumer: Consumer;
  private readonly kafka: Kafka;
  private readonly invoiceService: IInvoiceService;

  constructor(@inject("IInvoiceService") invoiceService: IInvoiceService) {
    this.invoiceService = invoiceService;
    this.kafka = new Kafka({
      clientId: "invoice-service",
      brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
      retry: {
        initialRetryTime: 100,
        retries: 5,
        maxRetryTime: 30000,
      },
    });
    this.consumer = this.consumer = this.kafka.consumer({
      groupId: "invoice-service-group",
      retry: {
        retries: 5
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: "payment-events",
        fromBeginning: true,
      });
      logger.info("Invoice Service Kafka Consumer connected");
    } catch (error) {
      logger.error("Failed to connect Invoice Service Kafka Consumer:", error);
    }
  }

  async startConsumer(): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (message.value) {
            const paymentEvent: PaymentEvent = JSON.parse(
              message.value.toString()
            );
            await this.processPaymentEvent(paymentEvent);
          }
        },
      });
      logger.info("Kafka consumer started successfully");
    } catch (error) {
      logger.error("Error processing message:", error);
      throw error;
    }
  }

  private async processPaymentEvent(paymentEvent: PaymentEvent): Promise<void> {
    try {
    
      if (paymentEvent.status === "SUCCESS") {
        const invoiceDto: InvoiceDto = {
          userId: paymentEvent.userId,
          paymentId: paymentEvent.paymentId,
          products: paymentEvent.products,
          totalPrice: paymentEvent.totalPrice,
        };

        const serviceResult = await this.invoiceService.createInvoice(invoiceDto);

        if (!serviceResult.IsSucceed) {
          logger.error(
            `Failed to create invoice for payment event: ${paymentEvent.userId}`,
            {
              error: serviceResult.Message,
            }
          );
          return;
        }

        logger.info(
          `Successfully created invoice for payment event: ${paymentEvent.userId}`
        );
      }
    } catch (error) {
      logger.error(
        `Failed to process payment event for invoice ${paymentEvent.userId}:`,
        error
      );
      
    }
  }
}
