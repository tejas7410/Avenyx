export class CreateProductDTO {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imagePath: string;
  sellerId: string;

  constructor(
    name: string,
    description: string,
    category: string,
    price: number,
    stock: number,
    imagePath: string,
    sellerId: string
  ) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.price = price;
    this.stock = stock;
    this.imagePath = imagePath;
    this.sellerId = sellerId;
  }
}
