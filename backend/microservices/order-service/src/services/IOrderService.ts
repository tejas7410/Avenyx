import { OrderDto } from "../dtos/OrderDto";
import { Order } from "../modals/OrderModal";
import { ServiceMessage } from "../types/ServiceMessage";

export interface IOrderService {
  createOrder(orderDto: OrderDto): Promise<ServiceMessage<Order>>;
  getOrders(userId: string): Promise<ServiceMessage<Order[]>>;
}
