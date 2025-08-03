import express, { Application, Request, Response } from "express";
import errorHandler from "./src/middlewares/errorHandler";
import {BasketRouter} from "./src/routes/BasketRouter";
import cors from 'cors';
import dotenv from "dotenv";
import { createServer } from "http";
dotenv.config();

const app : Application = express();
const httpServer = createServer(app); 

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.get("/", (req: Request, res: Response) => {
    res.send("NewMind AI - Mert Topcu - E-commerce Fullstack Microservice App");
});

app.use("/basket", BasketRouter);

app.use(errorHandler);

export default httpServer;