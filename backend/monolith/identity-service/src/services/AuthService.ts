// ************ Database -> Repository -> Service -> Controller **********

import { inject, injectable } from "inversify";
import { IAuthService } from "../services/IAuthService";
import { CreateUserDTO } from "../dtos/CreateUserDto";
import { User } from "../models/UserModel";
import { IAuthRepository } from "../repositories/IAuthRepository";
import bcrypt from "bcryptjs";
import { ServiceMessage } from "../types/ServiceMessage";
import { generateToken } from "../helpers/generateToken";
import { IIdentityRedisService } from "../../infrastructure/redis/IIdentityRedisService";
import { UserEventPublisher } from "../../infrastructure/kafka/UserEventPublisher";
import { logger } from "../../../config/logger";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

@injectable() // -> Injection inversify
export class AuthService implements IAuthService {
  private _authRepository: IAuthRepository;
  private _redisService: IIdentityRedisService;
  private _eventPublisher: UserEventPublisher;

  constructor(
    @inject("IAuthRepository") authRepository: IAuthRepository,
    @inject("IIdentityRedisService") redisService: IIdentityRedisService,
    @inject("UserEventPublisher") userEventPublisher: UserEventPublisher
  ) {
    this._authRepository = authRepository;
    this._redisService = redisService;
    this._eventPublisher = userEventPublisher;
  }

  // ************* Register a new user *************
  async register(
    createUserDto: CreateUserDTO
  ): Promise<ServiceMessage<{ token: string }>> {
    // ▼ 1-Desctruction DTO and check exist in database or not ▼
    const { name, surname, email, password } = createUserDto;
    const existingUser = await this._authRepository.findByEmail(email);
    if (existingUser) {
      return new ServiceMessage(
        false,
        "Sorry this email already registered..."
      );
    }

    // ▼ 2-Hash password and saving to database dto to model ▼
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        surname,
        email,
        password: hashedPassword,
        role: "user",
        isDeleted: false,
        deletedAt: null,
        isAvailable: true,
      });

      try {
        const newUserData = await this._authRepository.create(newUser);

        if (!newUserData) {
          throw new Error(
            "Failed to save the user. AuthRepository returned null."
          );
        }

        // -> Publish event in Kafka with PublishEventer
        try {

          await this._eventPublisher.publishUserEvent({
            userId: newUserData._id.toString(),
            isAvailable: true,
            eventType: "USER_CREATED",
          });
        } catch (eventError) {
          logger.error(
            `[Error at: AuthService - create - publishUserEvent()] , ${eventError}`
          );
        }
      } catch (error) {
        logger.error(
          `[Error at: AuthService - create - publishUserEvent()] , ${error}`
        );
      }

      // -> Helper method I created for generate token
      const token = generateToken(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET as string,
        "1h"
      );

      // -> This for catching token in redis, 60 min expiry time
      await this._redisService.setToken(newUser._id.toString(), token, 3600);

      return new ServiceMessage(true, "Registration is succesfull...", {
        token,
        userId: newUser._id.toString(),
      });
    } catch (error) {
      return new ServiceMessage(
        false,
        `There is a error in saving database processes: ${error}`
      );
    }
  }


  // ************* Login user *************

  async login(
    email: string,
    password: string
  ): Promise<ServiceMessage<{ token: string }>> {
    // ▼ 1-Finding user by email and check password ▼
    const user = await this._authRepository.findByEmail(email);
    if (!user) {
      return new ServiceMessage(false, "Invalid mail or password...");
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return new ServiceMessage(false, "Invalid mail or password...");
      }
    } catch (error) {
      return new ServiceMessage(
        false,
        `Error during password comparison...${error}`
      );
    }

    // ▼ 2-Generate a JWT token and return
    try {
      const token = generateToken(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        "1h"
      );

      // -> This for catching token in redis, 60 min expiry time
      await this._redisService.setToken(user._id.toString(), token, 3600);

      return new ServiceMessage(true, "Login is succesfull", {
        token,
        userId: user._id,
      });
    } catch (error) {
      return new ServiceMessage(false, `Error during token...${error}`);
    }
  }


  // ************* Logout user *************

  async logout(userId: string): Promise<ServiceMessage<void>> {
    try {
      await this._redisService.removeToken(userId);
      return new ServiceMessage(true, "Logout successful");
    } catch (error) {
      return new ServiceMessage(false, error);
    }
  }

  //#endregion
}
