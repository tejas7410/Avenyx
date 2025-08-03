// **************** This is my container for my dependency injections with 'inversify' ****************

import { Container } from "inversify";
import { OrderService } from "../services/OrderService";
import { IOrderService } from "../services/IOrderService";
import { OrderRepository } from "../repositories/OrderRepository";
import { IOrderRepository } from "../repositories/IOrderRepository";
import { OrderController } from "../controllers/OrderController";

const container = new Container();

// ▼ My dependency injection settings here ▼

container.bind<(IOrderRepository)>("IOrderRepository").to(OrderRepository);

container.bind<(IOrderService)>("IOrderService").to(OrderService);

container.bind<OrderController>(OrderController).toSelf();



export { container };