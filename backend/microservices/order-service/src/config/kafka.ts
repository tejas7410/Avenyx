// **************** ORder Service Kafka Consumer Settings ****************

import { Consumer, Kafka } from "kafkajs";
import { logger } from "./logger";
import { IOrderService } from "../services/IOrderService";
import { inject } from "inversify";
import { OrderDto } from "../dtos/OrderDto";
import { PaymentEvent } from "../types/PaymentEvent";

export class OrderServiceKafka {
  private consumer: Consumer;
  private readonly kafka: Kafka;
  private readonly orderService: IOrderService;

  constructor(@inject("IOrderService") orderService: IOrderService) {
    this.orderService = orderService;
    this.kafka = new Kafka({
      clientId: "order-service",
      brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
      retry: {
        initialRetryTime: 100,
        retries: 5,
        maxRetryTime: 30000,
      },
    });
    this.consumer = this.consumer = this.kafka.consumer({
      groupId: "order-service-group",
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
      logger.info("Order Service Kafka Consumer connected");
    } catch (error) {
      logger.error("Failed to connect Order Service Kafka Consumer:", error);
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
        const orderDto: OrderDto = {
          userId: paymentEvent.userId,
          paymentId: paymentEvent.paymentId,
          products: paymentEvent.products,
          totalPrice: paymentEvent.totalPrice,
        };

        const serviceResult = await this.orderService.createOrder(orderDto);

        if (!serviceResult.IsSucceed) {
          logger.error(
            `Failed to create order for payment event: ${paymentEvent.userId}`,
            {
              error: serviceResult.Message,
            }
          );
          return;
        }

        logger.info(
          `Successfully created order for payment event: ${paymentEvent.userId}`
        );
      }
    } catch (error) {
      logger.error(
        `Failed to process payment event for order ${paymentEvent.userId}:`,
        error
      );
      
    }
  }
}
