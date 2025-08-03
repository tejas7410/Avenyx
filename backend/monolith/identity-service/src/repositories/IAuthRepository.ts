import { IUser } from "../models/UserModel";

export interface IAuthRepository {
  create(user: IUser): Promise<IUser|null>; // Create a new user
  findByEmail(email: string): Promise<IUser | null>; // Find a user by email
}
