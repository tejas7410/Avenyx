import { Order } from "../modals/OrderModal";

export interface IOrderRepository{



    getOrdersByUserId(userId: string): Promise<Order[] | null>;

    createOrder(order:Order) : Promise<Order | null>;

    
}