 // -> Created for sending new product props to service(my business logic) from controller.

export class CreateProductDTO {
    name: string;
    description: string;
    category:string;
    price: number;
    stock: number;
    imagePath: string;
  
    constructor(name: string, description: string,category:string, price: number, stock: number, imagePath:string) {
      this.name = name;
      this.description = description;
      this.category=category;
      this.price = price;  
      this.stock = stock;     
      this.imagePath=imagePath;
    }
  }
  