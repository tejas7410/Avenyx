// **************** Mongo Db Cloud Settings ****************

import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI; //-> Getting connection string from .env

if (!mongoUri) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB Succesfully : ${mongoUri.slice(12,26)}...`); // -> Just for checking connection ...database
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
};
