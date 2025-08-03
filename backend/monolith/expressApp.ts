import express, { Application, NextFunction, Request, Response } from "express";
import AuthRouter from "./identity-service/src/routes/AuthRouter";
import ProductRouter from "./product-service/src/routes/ProductRouter";
import UserRouter from "./identity-service/src/routes/UserRouter";
import errorHandler from "./product-service/src/middlewares/errorHandler";
import cors from 'cors';

import dotenv from "dotenv";
dotenv.config();

const app: Application = express();

app.use(cors({
  origin: 'http://localhost:5173' 
}));

app.use(express.json());

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
