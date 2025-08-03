import { CreateUserDTO } from "../dtos/CreateUserDto";
import { ServiceMessage } from "../types/ServiceMessage";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

export interface IAuthService {
  register(createUserDto: CreateUserDTO): Promise<ServiceMessage<{ token: string }>>;
  login(email: string, password: string): Promise<ServiceMessage<{ token: string }>>;
  logout(userId: string): Promise<ServiceMessage<void>>;
}

