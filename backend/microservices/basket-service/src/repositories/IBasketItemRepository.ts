import { BasketItemDto } from "../dtos/BasketItemDto"


export interface IBasketItemRepository{
    
    getBasketItem(key:string):Promise<BasketItemDto | null>;
    
    saveBasketItem(basketItem:BasketItemDto,ttl:number):Promise<void>;
    
    deleteBasketItem(key:string):Promise<void>
    
}