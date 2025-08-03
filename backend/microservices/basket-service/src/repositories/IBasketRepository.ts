import { BasketDto } from "../dtos/BasketDto";


export interface IBasketRepository{
    
    getBasket(key:string):Promise<BasketDto | null>;
    
    saveBasket(basket:BasketDto,ttl:number):Promise<void>;
    
    deleteBasket(key:string):Promise<void>

    findBasketsByProductId(productId: string): Promise<BasketDto[]|null>;
    
}