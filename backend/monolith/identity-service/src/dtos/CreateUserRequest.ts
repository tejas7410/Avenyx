// -> Created for taking new user infos from request body in controller

import { IsString, IsEmail, MinLength, MaxLength, IsIn } from "class-validator";

export class CreateUserRequest {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  surname!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsString()
  @IsIn(["seller", "buyer", "admin"])
  role!: string;
}
