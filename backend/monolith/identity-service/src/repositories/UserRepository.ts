// ************ Database -> Repository -> Service -> Controller **********

import { injectable } from "inversify";
import { IUser, User } from "../models/UserModel";
import { IUserRepository } from "./IUserRepository";

@injectable()
export class UserRepository implements IUserRepository {
 
  // -> Find a user by ID
  async findById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      console.error("Error finding user by id:", error);
      return null;
    }
  }

  // -> Update user information
  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    try {
      const updatedUser = await User.findByIdAndUpdate(id, user, {
        new: true, 
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  // -> Soft delete a user by default, but I created optional for hard delete too if necessary
  async delete(id: string, hardDelete: boolean = false): Promise<void> {
    try {
      const user = await User.findById(id);
      if (user) {
        if (hardDelete) {
          // -> Hard delete: Remove the user completely from the database
          await User.findByIdAndDelete(id);
        } else {
          // -> Soft delete: Set 'isDeleted' to true and record the deletedAt timestamp
          user.isDeleted = true;
          user.deletedAt = new Date();
          await user.save();
        }
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
}
