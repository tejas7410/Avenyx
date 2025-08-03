export class BasketItemDto {
    
    id:string;
    name: string;
    imageUrl:string;
    price: number;
    quantity: number;
  
    constructor(id:string,name: string, imageUrl:string, price: number, quantity: number) {
      this.id=id;
      this.name = name;
      this.imageUrl=imageUrl;
      this.price = price;  
      this.quantity = quantity;      
    }
    
  }