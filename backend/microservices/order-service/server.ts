import "reflect-metadata";
import expressApp from "./expressApp";
import { connectToDatabase } from "./src/config/mongoose";
import dotenv from "dotenv";
import { OrderServiceKafka } from "./src/config/kafka";
import { IOrderService } from "./src/services/IOrderService";
import { container } from "./src/infrastructure/inversify";
import { logger } from "./src/config/logger";
dotenv.config();

const PORT = process.env.SERVER_PORT || 3003;

export const StartServer = async () => {
  try {

    // -> Connect to the database
    await connectToDatabase();

    // -> Connect Kafka Service
    try {
      const orderKafkaService = new OrderServiceKafka(
        container.get<IOrderService>("IOrderService")
      );
      await orderKafkaService.connect();
      await orderKafkaService.startConsumer();
    } catch (error) {
      logger.error("Failed to connect to Kafka:", error);
    }

    // -> Then start the server if database connection is successful
    expressApp.listen(PORT, () => {
      console.log(`Listening port at ${PORT}`);
    });

    process.on("uncaughtException", async (err) => {
      console.log(err);
      process.exit(1);
    });

  } catch (error) {
    console.error(
      "Connection failed, shutting down the server",
      error
    );
    process.exit(1); // Stop the process if the database connection fails
  }
};

StartServer().then(() => {
  console.log(`Server is up in ${PORT} port!`);
});
