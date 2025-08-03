// **************** Auth Controller (Register, Login, Logout) ****************

import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { CreateUserRequest } from "../dtos/CreateUserRequest";
import { CreateUserDTO } from "../dtos/CreateUserDto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { IAuthService } from "../services/IAuthService";
import { JwtPayload } from "jsonwebtoken";


@injectable() // -> This is for dependency injection - inversify
export class AuthController {
  
  // ▼ Constructor injection ( service ) below ▼
  private _authService: IAuthService;

  constructor(@inject("IAuthService") authService: IAuthService) {
    this._authService = authService;
  }

// ************* Register a new user *************
  async register(req: Request, res: Response) {
   
    // ▼ 1-Transform the request body into a CreateUserRequest object with using class-transformer ▼
    const createUserRequest = plainToClass(CreateUserRequest, req.body);

    // ▼ 2-Validate the incoming request and handle errors with using class-validator ▼
    const errors = await validate(createUserRequest);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // ▼ 3-Map the validated request to a DTO (for service) ▼
    const { name, surname, password, email } = createUserRequest;
    const createUserDTO = new CreateUserDTO(name, surname, password, email);

    // ▼ 4-Calling service and sending DTO ▼
    try {
      const serviceResult = await this._authService.register(createUserDTO);
      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult.Message });
      }

      const token = serviceResult.Data; // -> Returning token as data in my scenario data is generic and in that case token
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(200).json({
        message: serviceResult.Message,
        data: token, // -> Include the token in the response body to client as well
      });

    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }


// ************* Login user *************
  async login(req: Request, res: Response) {

    // ▼ 1-Take email and password from body and sending to service ▼
    const { email, password } = req.body;
    try {
      
      const serviceResult = await this._authService.login(email, password);
      if (!serviceResult.IsSucceed) {
        return res.status(400).json({ message: serviceResult.Message });
      }

      const token = serviceResult.Data; // -> Returning token as data in my scenario data is generic and in that case token

      return res.status(200).json({
        message: serviceResult.Message,
        token: token, // -> Include the token in the response body to client as well
      });

    } catch (error) {

      return res.status(500).json({ message: "Server-side error", error }); // Respond with error message

    }
  }

// ************* Logout user *************
async logout(req: Request, res: Response) {
  
  try {
    
    const userId = (req.user as JwtPayload).id;

    console.log("USER ID :",userId)
    
    const serviceResult=await this._authService.logout(userId);
    
    if (!serviceResult.IsSucceed){
      return res.status(400).json({ message: serviceResult.Message });
    }

    return res.status(200).json({ message: serviceResult });

  } catch (error) {

    return res.status(500).json({ message: "Server-side error", error });

  }
}
};
