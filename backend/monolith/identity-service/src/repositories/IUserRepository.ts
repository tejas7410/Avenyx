import { IUser } from "../models/UserModel";

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>; // Find a user by id
  update(id: string, user: Partial<IUser>): Promise<IUser | null>; // Update user information
  delete(id: string): Promise<void>; // Delete a user by id
}
