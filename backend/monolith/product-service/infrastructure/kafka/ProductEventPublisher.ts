// **************** Product Service Kafka Producer Settings ****************

import { Kafka } from "kafkajs";
import { logger } from "../../../config/logger";
import { ProductEventType } from "./types";

interface ProductEvent {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: String;
  eventType: ProductEventType;
}

export class ProductEventPublisher {
  private kafka: Kafka;
  private producer;
  private isConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: "product-service",
      brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
      retry: {
        initialRetryTime: 100,
        retries: 5,
        maxRetryTime: 30000,
      },
    });
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
      maxInFlightRequests: 5,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      logger.info('Product Service Kafka Producer connected');
    } catch (error) {
      logger.error('Failed to connect Product Service Kafka Producer:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async publishProductEvent(event: ProductEvent) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      await this.producer.send({
        topic: "product-events",
        messages: [{ value: JSON.stringify(event) }],
      });
      logger.info("Kafka product event published successfully");
    } catch (error) {
      logger.error(`Error publishing product event: ${error}`);
      throw error; // Let the caller handle the error
    }
  }
}
