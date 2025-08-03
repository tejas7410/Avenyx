import { GetUserDetailsDto } from "../dtos/GetUserDetailsDto";
import { GetUserValidDto } from "../dtos/GetUserValidDto";
import { IUser } from "../models/UserModel";
import { ServiceMessage } from "../types/ServiceMessage";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

export interface IUserService {
  getProfile(id:string):Promise<ServiceMessage<GetUserDetailsDto>>;
  updateProfile(id: string, product: Partial<IUser>): Promise<ServiceMessage<{}>>; 
  deleteUser(id: string, hardDelete: boolean): Promise<ServiceMessage<{}>>; 
  validUser(id:string):Promise<ServiceMessage<GetUserValidDto>>;
}
