// **************** Identity Service Kafka Producer Settings ****************

import { Kafka } from "kafkajs";
import { logger } from "../../../config/logger";
import { UserEventType } from "./types";

interface UserEvent {
  userId: string;
  isAvailable: boolean;
  eventType: UserEventType;
}

export class UserEventPublisher {
  
  private kafka: Kafka;
  private producer;
  
  constructor() {
    //-> Init
    this.kafka = new Kafka({
      clientId: "user-service",
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
      logger.info('Identity Service Kafka Producer connected');
    } catch (error) {
      logger.error('Failed to connect Identity Service Kafka Producer:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async publishUserEvent(event: UserEvent) {
    try {
      await this.producer.send({
        topic: "user-events",
        messages: [{ value: JSON.stringify(event) }],
      });

      logger.info("Kafka user event published successfully");

    } catch (error) {
      logger.error(`Error publishing user event: ${error}`);
    } 
  }
}
