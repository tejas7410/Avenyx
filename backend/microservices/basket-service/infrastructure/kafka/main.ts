// **************** Basket Service Kafka Consumer Settings ****************

import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { IBasketRepository } from "../../src/repositories/IBasketRepository";
import { IBasketItemRepository } from "../../src/repositories/IBasketItemRepository";
import { logger } from "../../config/logger";
import { BasketItemDto } from "../../src/dtos/BasketItemDto";
import { injectable, inject } from "inversify";

// -> Event interfaces
interface ProductEvent {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  eventType: "PRODUCT_CREATED" | "PRODUCT_UPDATED" | "PRODUCT_DELETED";
}

interface UserEvent {
  userId: string;
  isAvailable: boolean;
  eventType: "USER_UPDATED" | "USER_DELETED" | "USER_CREATED";
}

@injectable()
export class BasketEventConsumer {
  private readonly USER_VALID_TTL = 60 * 60 * 24 * 1; // 1 days
  private readonly PRODUCT_VALID_TTL = 60 * 60 * 24 * 7; // 7 days
  private readonly BASKET_TTL = 60 * 60 * 24 * 1; // 1 days

  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    @inject("IBasketRepository")
    private readonly basketRepository: IBasketRepository,
    @inject("IBasketItemRepository")
    private readonly basketItemRepository: IBasketItemRepository
  ) {
    this.kafka = new Kafka({
      clientId: "basket-service",
      brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
      retry: {
        initialRetryTime: 1000,
        retries: 10,
        maxRetryTime: 30000,
        factor: 1.5,
      },
      connectionTimeout: 10000,
    });

    this.consumer = this.kafka.consumer({
      groupId: "basket-service-group",
      retry: {
        retries: 10
      },
      readUncommitted: false,
      maxWaitTimeInMs: 5000,
      maxBytes: 1048576, // 1MB
    });
  }

  async start(): Promise<void> {
    try {
      

      await this.consumer.connect();
   
      logger.info("Basket event consumer connected to Kafka");

      await this.consumer.subscribe({
        topics: ["product-events", "user-events"],
      });

      logger.info("Consumer subscribed to topics", {
        groupId: "basket-service-group",
        topics: ["product-events", "user-events"]
      });

      await this.consumer.run({
        autoCommit: false,
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            const { topic, partition, message } = payload;

            logger.info(`Received message`, {
              topic,
              partition,
              offset: message.offset,
              timestamp: message.timestamp
            });

            await this.handleMessage(payload);
          } catch (error) {
            logger.error(`Error processing message: ${error}`);
          }
        },
      });
    } catch (error) {
      logger.error(`Failed to start basket event consumer: ${error}`);
    }
  }

  private async handleMessage({
    topic,
    message,
  }: EachMessagePayload): Promise<void> {
    
    if (!message.value) {
      logger.warn("Received message with no value");
      return;
    }

    try {
      
      const event = JSON.parse(message.value.toString());

      switch (topic) {
        case "product-events":
          await this.handleProductEvent(event as ProductEvent);
          break;
        case "user-events":
          await this.handleUserEvent(event as UserEvent);
          break;
        default:
          logger.warn(`Unknown topic: ${topic}`);
      }
    } catch (error) {
      logger.error(`Error parsing message: ${error}`);
    }
  }

  private async handleProductEvent(event: ProductEvent): Promise<void> {
    
    const { productId, eventType, name, price, stock, imageUrl } = event;

    switch (eventType) {

      case "PRODUCT_CREATED": {
       
        const newProduct = new BasketItemDto(
          productId,
          name,
          imageUrl,
          price,
          stock
        );

        // -> Save the new product to the cache
        await this.basketItemRepository.saveBasketItem(
          newProduct,
          this.PRODUCT_VALID_TTL
        );

        // -> Update baskets with the new product
        const affectedBasketsResult =
          await this.basketRepository.findBasketsByProductId(productId);
        if (!affectedBasketsResult || affectedBasketsResult.length === 0) {
          logger.info(`No baskets found containing product: ${productId}`);
          return;
        }

        for (const basket of affectedBasketsResult) {
          try {
            const updatedItems = [...basket.basketItems, newProduct];

            basket.basketItems = updatedItems;
            basket.totalPrice = basket.calculateTotalPrice();

            await this.basketRepository.saveBasket(basket, this.BASKET_TTL);
          } catch (error) {
            logger.error(`Failed to update basket ${basket.userId}: ${error}`);
          }
        }
        break;
      }

      case "PRODUCT_UPDATED": {
        const updatedProduct = new BasketItemDto(
          productId,
          name,
          imageUrl,
          price,
          stock
        );

        // -> Save updated product to cache
        await this.basketItemRepository.saveBasketItem(
          updatedProduct,
          this.PRODUCT_VALID_TTL
        );

        // -> Update affected baskets
        const affectedBasketsResult =
          await this.basketRepository.findBasketsByProductId(productId);
        if (!affectedBasketsResult || affectedBasketsResult.length === 0) {
          logger.info(`No baskets found containing product: ${productId}`);
          return;
        }

        for (const basket of affectedBasketsResult) {
          try {
            const updatedItems = basket.basketItems.map((item) =>
              item.id === productId ? { ...item, price, name, imageUrl } : item
            );

            basket.basketItems = updatedItems;

            basket.totalPrice = basket.calculateTotalPrice();

            await this.basketRepository.saveBasket(basket, this.BASKET_TTL);
          } catch (error) {
            logger.error(`Failed to update basket ${basket.userId}: ${error}`);
          }
        }
        break;
      }

      case "PRODUCT_DELETED": {

        // -> Delete from cache first
        await this.basketItemRepository.deleteBasketItem(productId);

        // -> Remove from affected baskets
        const affectedBasketsResult =
          await this.basketRepository.findBasketsByProductId(productId);
        if (!affectedBasketsResult || affectedBasketsResult.length === 0) {
          return;
        }

        for (const basket of affectedBasketsResult) {
          try {
            basket.basketItems = basket.basketItems.filter(
              (item) => item.id !== productId
            );
            basket.totalPrice = basket.calculateTotalPrice();
            await this.basketRepository.saveBasket(basket, this.BASKET_TTL);
          } catch (error) {
            logger.error(`Failed to update basket ${basket.userId}: ${error}`);
          }
        }
        break;
      }
    }
  }

  private async handleUserEvent(event: UserEvent): Promise<void> {
    const { userId, eventType, isAvailable } = event;

    switch (eventType) {
      case "USER_DELETED":
      case "USER_UPDATED": {
        if (!isAvailable) {
          try {
            await this.basketRepository.deleteBasket(userId);
            logger.info(`Deleted basket for unavailable user: ${userId}`);
          } catch (error) {
            logger.error(
              `Failed to delete basket for user ${userId}: ${error}`
            );
          }
        }
        break;
      }
    }
  }

  async stop(): Promise<void> {

    try {
      await this.consumer.disconnect();
      logger.info("Basket event consumer disconnected from Kafka");
    } catch (error) {
      logger.error(`Error disconnecting basket event consumer: ${error}`);
      throw error;
    }
  }
};
