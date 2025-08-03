import { inject, injectable } from "inversify";
import "reflect-metadata";
import { IOrderService } from "./IOrderService";
import { IOrderRepository } from "../repositories/IOrderRepository";
import { Order } from "../modals/OrderModal";
import { OrderDto } from "../dtos/OrderDto";
import { ServiceMessage } from "../types/ServiceMessage";
import { logger } from "../config/logger";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

@injectable()
export class OrderService implements IOrderService {
  private readonly orderRepository: IOrderRepository;

  constructor(@inject("IOrderRepository") orderRepository: IOrderRepository) {
    this.orderRepository = orderRepository;
  }

  async createOrder(orderDto: OrderDto): Promise<ServiceMessage<Order>> {
    // -> Desctruct from paymentDto
    const { userId,paymentId, products, totalPrice } = orderDto;

  //  console.log("Products at Service",products);

    const order = new Order({ userId, paymentId, products, totalPrice });

    // console.log("ORDER at Service",order);

    try {
      const savedOrder = await this.orderRepository.createOrder(order);

      // -> Checking Repository Result
      if (!savedOrder) {
        return new ServiceMessage(
          false,
          "Failed to save invoice [Error: OrderRepository]."
        );
      }

      return new ServiceMessage(true, "Order created successfully.", order);
    } catch (error) {
      logger.error("Error saving payment:", error);
      return new ServiceMessage(false, "Error saving orders.");
    }
  }

  async getOrders(userId: string): Promise<ServiceMessage<Order[]>> {
    try {
      const orders = await this.orderRepository.getOrdersByUserId(userId);

      if (!orders || orders.length === 0) {
        return new ServiceMessage(false, "No orders found for the given user.");
      }

      return new ServiceMessage(true, "Orders retrieved successfully.", orders);
    } catch (error) {
      logger.error("Error retrieving orders:", error);
      return new ServiceMessage(false, "Error retrieving orders.");
    }
  };
}
