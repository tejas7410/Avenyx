import "reflect-metadata";
import expressApp from "./expressApp";
import { connectToDatabase } from "./config/mongoose";
import dotenv from "dotenv";
import { redisClient } from "./config/redis";
import { container } from "./config/inversify";
import { UserEventPublisher } from "./identity-service/infrastructure/kafka/UserEventPublisher";
import { ProductEventPublisher } from "./product-service/infrastructure/kafka/ProductEventPublisher";
import { logger } from "./config/logger";
dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;

export const StartServer = async () => {
  try {

    // -> Kafka Services binding
    const identityKafkaService=container.get<UserEventPublisher>("UserEventPublisher");
    const productKafkaService=container.get<ProductEventPublisher>("ProductEventPublisher");

    // -> Connect to the database
    await connectToDatabase();

    // -> Connect to the Kafka
    await identityKafkaService.connect();
    await productKafkaService.connect();

    // -> Connect to the Redis
    redisClient.on("connect", () => console.log("Redis connected"));
    redisClient.on("error", (err) => console.error("Redis error:", err));

    // -> Starting server
    expressApp.listen(PORT, () => {
      console.log(`Listening port at ${PORT}`);
    });

    process.on("uncaughtException", async (err) => {
      console.log(err);
      process.exit(1);
    });

  } catch (error) {
    logger.error(
      "Connections failed [server.ts], shutting down the server",
      error
    );
    process.exit(1); // -> Stop the process
  }
};

StartServer().then(() => {
  console.log(`Server is up in ${PORT} port!`);
});
