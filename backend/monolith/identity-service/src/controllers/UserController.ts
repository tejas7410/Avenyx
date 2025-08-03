// **************** User Controller (Profile operations etc.) ****************

import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { IUserService } from "../services/IUserService";
import { JwtPayload } from "jsonwebtoken";


@injectable() // -> This is for dependency injection - inversify
export class UserController {
  private _userService: IUserService;

  constructor(@inject("IUserService") userService: IUserService) {
    this._userService = userService;
  }

  // ************* Get User Profile *************
  async getProfile(req: Request, res: Response) {
    try {
      
      const userId = (req.user as JwtPayload).id; // -> Get user id from payload I defined in token register and login
      
      const serviceResult = await this._userService.getProfile(userId);

      if (!serviceResult.IsSucceed) {
        return res.status(404).json({ message: serviceResult.Message });
      }

      return res.status(200).json({ user_data: serviceResult.Data });
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }


  // ************* Update User Profile *************
  async updateProfile(req: Request, res: Response) {
    try {
      
      const userId = (req.user as JwtPayload).id; // -> Get user id from payload I defined in token register and login
      
      const updatedData = req.body;

      const serviceResult = await this._userService.updateProfile(
        userId,
        updatedData
      );

      if (!serviceResult.IsSucceed) {
        return res.status(404).json({ message: serviceResult.Message });
      }

      return res.status(200).json({ message: serviceResult.Message });
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

  // ************* Delete User *************
  async deleteUser(req: Request, res: Response) {
    try {

      const userId = (req.user as JwtPayload).id;

      const serviceResult= await this._userService.deleteUser(userId, false); // -> false for hard delete I created this logic in my scenario

      if (!serviceResult.IsSucceed) {
        return res.status(404).json({ message: serviceResult.Message });
      }

      return res
        .status(200)
        .json({ message: serviceResult.Message });
    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }

   // ************* Valid User Mostly for Basket Microservice Redis *************
  async userValid(req:Request,res:Response){
    
    const { id } = req.params;

    try {
      
      const serviceResult = await this._userService.validUser(id);

      if (!serviceResult.IsSucceed) {
        return res.status(404).json({ message: serviceResult.Message });
      }
      return res.status(200).json(serviceResult.Data);

    } catch (error) {
      return res.status(500).json({ message: "Server-side error", error });
    }
  }
}
