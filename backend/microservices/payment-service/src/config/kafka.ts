// **************** Payment Service Kafka Producer Settings ****************

import { Kafka, Producer } from "kafkajs";
import { logger } from "./logger";
import { PaymentEvent } from "../types/PaymentEvent";

export class PaymentServiceKafka {
  private producer: Producer;
  private readonly kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: "payment-service",
      brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
      retry: {
        initialRetryTime: 100,
        retries: 5,
        maxRetryTime: 30000,
      },
    });

    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      logger.info('Payment Service Kafka Producer connected');
    } catch (error) {
      logger.error('Failed to connect Payment Service Kafka Producer:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async sendPaymentEvent(paymentEvent: PaymentEvent): Promise<void> {
    try {
      await this.producer.send({
        topic: 'payment-events',
        messages: [
          {
            key: paymentEvent.userId,
            value: JSON.stringify(paymentEvent)
          }
        ]
      });

    } catch (error) {
      logger.error('Failed to send payment event [PaymentService-Kafka]:', error);
    }
  }
}










