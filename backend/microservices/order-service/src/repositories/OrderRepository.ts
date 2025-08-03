import { injectable } from "inversify";
import { IOrderRepository } from "./IOrderRepository";
import { Order } from "../modals/OrderModal";
import { logger } from "../config/logger";


@injectable()
export class OrderRepository implements IOrderRepository{

    async createOrder(order:Order) : Promise<Order | null> {
        
      
      try {
            const newOrder=new Order(order);
            console.log("ORDER at Repository",order);
            await newOrder.save();
            return order;
        } catch (error) {
            logger.error("Error creating order:", error);
            return null;
        }
    }

    async getOrdersByUserId(userId: string): Promise<Order[] | null> {
        try {
            
          const orders = await Order.find({ userId, isDeleted: false });
       
          return orders;
        } catch (error) {
          logger.error("Error getting orders by userId [OrderRepository]:", error);
          return null;
        }
      }
}