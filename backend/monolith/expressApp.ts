import express, { Application, NextFunction, Request, Response } from "express";
import path from "path";
import AuthRouter from "./identity-service/src/routes/AuthRouter";
import ProductRouter from "./product-service/src/routes/ProductRouter";
import UserRouter from "./identity-service/src/routes/UserRouter";
import errorHandler from "./product-service/src/middlewares/errorHandler";
import cors from 'cors';

import dotenv from "dotenv";
dotenv.config();

const app: Application = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
}));

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "images"))
);

app.get("/", (req: Request, res: Response) => {
  res.send("NewMind AI - Mert Topcu - E-commerce Fullstack Microservice App");
});

// -> My routes from /router
app.use("/auth", AuthRouter);
app.use("/products", ProductRouter);
app.use("/user", UserRouter);

// -> My errorhandler middleware I just used info and error level for now handle with winston
app.use(errorHandler);

export default app;
