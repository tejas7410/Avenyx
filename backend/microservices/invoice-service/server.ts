import "reflect-metadata";
import expressApp from "./expressApp";
import { connectToDatabase } from "./src/config/mongoose"
import dotenv from "dotenv";
import { container } from "./src/infrastructure/inversify";
import { IInvoiceService } from "./src/services/IInvoiceService";
import { InvoiceServiceKafka } from "./src/config/kafka";
import { logger } from "./src/config/logger";
dotenv.config();

const PORT = process.env.SERVER_PORT || 3004;

export const StartServer = async () => {
  try {

    // -> Connect to the database
    await connectToDatabase();

    // -> Connect Kafka Service
    try {
      const invoiceKafkaService = new InvoiceServiceKafka(
        container.get<IInvoiceService>("IInvoiceService")
      );
      await invoiceKafkaService.connect();
      await invoiceKafkaService.startConsumer();

    } catch (error) {
      logger.error("Failed to connect to Kafka:", error);
    }

    // -> Then start the server if connection is successful
    expressApp.listen(PORT, () => {
      console.log(`Listening port at ${PORT}`);
    });

    process.on("uncaughtException", async (err) => {
      console.log(err);
      process.exit(1);
    });

  } catch (error) {
    console.error(
      "Database connection failed, shutting down the server",
      error
    );
    process.exit(1); // Stop the process if the connection fails
  }
};

StartServer().then(() => {
  console.log(`Server is up in ${PORT} port!`);
});
