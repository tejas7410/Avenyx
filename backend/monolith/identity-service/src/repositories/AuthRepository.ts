// ************ Database -> Repository -> Service -> Controller **********

import { injectable } from "inversify";
import { IUser } from "../models/UserModel";
import { User } from "../models/UserModel";
import { IAuthRepository } from "./IAuthRepository";

@injectable()
export class AuthRepository implements IAuthRepository {
  
  // -> Create a new user
  async create(user: IUser): Promise<IUser|null> {
    try {
      const newUser = new User(user);
      await newUser.save();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  // -> Find a user by email
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
}
