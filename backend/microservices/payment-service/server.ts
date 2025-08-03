import "reflect-metadata";
import expressApp from "./expressApp";
import { connectToDatabase } from "./src/config/mongoose";
import { PaymentServiceKafka } from "./src/config/kafka";
import dotenv from "dotenv";
import { container } from "./src/config/inversify";
dotenv.config();


const PORT = process.env.SERVER_PORT || 3002;

export const StartServer = async () => {
  try {

    const paymentKafkaService = container.get<PaymentServiceKafka>("PaymentServiceKafka");

    // -> connect to the database
    await connectToDatabase();

    // -> connect to the kafka
    await paymentKafkaService.connect();

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
      "Database connection failed, shutting down the server",
      error
    );
    process.exit(1); // Stop the process if connection fails
  }
};

StartServer().then(() => {
  console.log(`Server is up in ${PORT} port!`);
});
