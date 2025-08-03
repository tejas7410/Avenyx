 // -> Created for sending new product props to controller from client. Used class-validator for validation processes.

 import { IsString, IsEmail, MinLength, MaxLength, IsDecimal, IsNumber, Min } from "class-validator";

export class CreateProductRequest {
  
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  _name: string;

  @IsString()
  _category: string;

  @IsString()
  @MinLength(2)
  _description: string;

  // @IsNumber()
  // @Min(0)
  _price: number;

  // @IsNumber()
  // @Min(0)
  _stock: number;

  _image:File;

  constructor(name:string,category:string,description:string,price:number,stock:number,image:File){
    this._name=name;
    this._category=category;
    this._description=description;
    this._price=price;
    this._stock=stock;
    this._image=image;
  }

}