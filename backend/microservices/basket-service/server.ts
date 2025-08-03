import "reflect-metadata";
import httpServer from "./expressApp";
import { redisClient } from "./config/redis";
import dotenv from "dotenv";
import { BasketEventConsumer } from "./infrastructure/kafka/main";
import { container } from "./config/inversify";
import { IWebSocketService } from "./src/services/IWebSocketService";
dotenv.config();

const PORT = process.env.SERVER_PORT || 3001;

export const StartServer = async () => {
  try {

    // -> Init websocket
    const webSocketService =
      container.get<IWebSocketService>("IWebSocketService");
    webSocketService.initialize(httpServer);

    // -> Kafka connection
    const basketKafkaService = container.get<BasketEventConsumer>(
      "BasketEventConsumer"
    );
    await basketKafkaService.start();

    // -> Redis connection
    redisClient.on("connect", () => console.log("Redis connected"));
    redisClient.on("error", (err) => console.error("Redis error:", err));

    httpServer.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });

    process.on("uncaughtException", async (err) => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

StartServer().then(() => {
  console.log(`Server is up in ${PORT} port!`);
});
