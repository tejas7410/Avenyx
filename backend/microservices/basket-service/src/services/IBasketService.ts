import { BasketDto } from "../dtos/BasketDto";
import { BasketRequest } from "../dtos/BasketRequest";
import { ServiceMessage } from "../types/ServiceMessage";

export interface IBasketService{

    getBasket(userId: string): Promise<ServiceMessage<BasketDto>>;
    saveBasket(basketRequest: BasketRequest): Promise<ServiceMessage<BasketDto>>;
    deleteBasket(userId: string): Promise<ServiceMessage<void>>;
    removeProductFromBasket(userId: string, productId: string): Promise<ServiceMessage<BasketDto>>;
}