import express, { Application, Request, Response } from "express";
import {OrderRouter} from "./src/routes/OrderRouter";
import cors from 'cors';
import dotenv from "dotenv";
import errorHandler from "./src/middlewares/errorHandler";
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
app.use("/api/v1/order",OrderRouter)

// -> My errorhandler middleware I just used info and error level for now handle with winston
app.use(errorHandler);

export default app;
