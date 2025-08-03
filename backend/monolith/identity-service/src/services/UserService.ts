// ************ Database -> Repository -> Service -> Controller **********

import { inject, injectable } from "inversify";
import { IUser } from "../models/UserModel";
import { IUserRepository } from "../repositories/IUserRepository";
import { ServiceMessage } from "../types/ServiceMessage";
import { IUserService } from "./IUserService";
import { GetUserDetailsDto } from "../dtos/GetUserDetailsDto";
import { GetUserValidDto } from "../dtos/GetUserValidDto";
import { UserEventPublisher } from "../../infrastructure/kafka/UserEventPublisher";
import { logger } from "../../../config/logger";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

@injectable()
export class UserService implements IUserService {
  private _repository: IUserRepository;
  private _eventPublisher: UserEventPublisher;

  constructor(@inject("IUserRepository") repository: IUserRepository) {
    this._repository = repository;
    this._eventPublisher = new UserEventPublisher();
  }

  async getProfile(id: string): Promise<ServiceMessage<GetUserDetailsDto>> {
    const user = await this._repository.findById(id);

    if (!user) {
      return new ServiceMessage(false, "No user found...");
    }

    const { _id, name, surname, email } = user;

    const userDetails = new GetUserDetailsDto(
      _id.toString(),
      name,
      surname,
      email
    );

    return new ServiceMessage(true, "Succesful", userDetails);
  }

  async updateProfile(
    id: string,
    product: Partial<IUser>
  ): Promise<ServiceMessage<{}>> {
    try {
      const updatedUser = await this._repository.update(id, product);

      if (!updatedUser) {
        return new ServiceMessage(
          false,
          "No user found to update with parameters."
        );
      }

      // -> Publish event in Kafka with PublishEventer
      try {
        await this._eventPublisher.publishUserEvent({
          userId: updatedUser._id.toString(),
          isAvailable: updatedUser.isAvailable,
          eventType: "USER_UPDATED",
        });
      } catch (eventError) {
        logger.error(
          `[Error at: UserService - updateProfile - publishUserEvent()] , ${eventError}`
        );
      }

      return new ServiceMessage(true, "User updated successfully.");

    } catch (error) {
      return new ServiceMessage(false, `Error updating user: ${error}`);
    }
  }

  async deleteUser(
    id: string,
    hardDelete: boolean = false
  ): Promise<ServiceMessage<{}>> {
    try {
      const user = await this._repository.findById(id);

      if (!user) {
        return new ServiceMessage(false, "No user found to delete.");
      }

      try {

        await this._repository.delete(id);

        // -> Publish event in Kafka with PublishEventer
        try {
          await this._eventPublisher.publishUserEvent({
            userId: id,
            isAvailable: false,
            eventType: "USER_DELETED",
          });
        } catch (eventError) {
          logger.error(
            `[Error at: UserService - deleteUser - publishUserEvent()] , ${eventError}`
          );
        }
      } catch (error) {
        logger.error(
          `[Error at: UserService - repository.delete()] , ${error}`
        );
      }

      return new ServiceMessage(true, "User deleted succesfully...");

    } catch (error) {
      return new ServiceMessage(false, `Error deleting user: ${error}`);
    }
  }

  async validUser(id: string): Promise<ServiceMessage<GetUserValidDto>> {
    const user = await this._repository.findById(id);

    if (!user) {
      return new ServiceMessage(false, "No user found...");
    }

    const { _id, isAvailable } = user;

    const userValid = new GetUserValidDto(_id.toString(), isAvailable);

    return new ServiceMessage(true, "Succesful", userValid);
  }
}
