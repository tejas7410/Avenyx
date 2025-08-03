import { inject } from "inversify";
import { IBasketRepository } from "../repositories/IBasketRepository";
import { IBasketService } from "./IBasketService";
import { ServiceMessage } from "../types/ServiceMessage";
import { BasketDto } from "../dtos/BasketDto";
import { BasketRequest } from "../dtos/BasketRequest";
import axios from "axios";
import { IBasketItemRepository } from "../repositories/IBasketItemRepository";
import { IUserValidRepository } from "../repositories/IUserValidRepository";
import { UserValidDto } from "../dtos/UserValidDto";
import { logger } from "../../config/logger";
import { BasketItemDto } from "../dtos/BasketItemDto";

// -> I m managing my controller-service communication with 'ServiceMessage' type I defined in '/types'.

export class BasketService implements IBasketService {
  private readonly USER_VALID_TTL = 60 * 60 * 24 * 1; // 1 days
  private readonly PRODUCT_VALID_TTL = 60 * 60 * 24 * 7; // 7 days
  private readonly BASKET_TTL = 60 * 60 * 24 * 1; // 1 days

  constructor(
    @inject("IBasketRepository")
    private readonly basketRepository: IBasketRepository,
    @inject("IBasketItemRepository")
    private readonly basketItemRepository: IBasketItemRepository,
    @inject("IUserValidRepository")
    private readonly userValidRepository: IUserValidRepository
  ) {}

  async getBasket(userId: string): Promise<ServiceMessage<BasketDto>> {
    try {
      // -> Try to get existing basket
      const existingBasket = await this.basketRepository.getBasket(userId);

      if (existingBasket) {
        return new ServiceMessage(true, "Existing Basket", existingBasket);
      }

      // -> Validate user if no basket exists
      const isValidUser = await this.validateUser(userId);
      if (!isValidUser) {
        return new ServiceMessage(false, "User is invalid");
      }

      // -> Create new empty basket for valid user
      const newBasket = new BasketDto(userId, [], 0, new Date(), new Date());

      // -> Adding new basket to cache
      await this.basketRepository.saveBasket(newBasket, this.BASKET_TTL);

      return new ServiceMessage(true, "New basket created", newBasket);
    } catch (error) {
      logger.error("[Basket Service - getBasket]", error);
      return new ServiceMessage(false, `Error getting basket: ${error}`);
    }
  }

  async saveBasket(
    basketRequest: BasketRequest
  ): Promise<ServiceMessage<BasketDto>> {
    try {
      const { userId, productId, productName, quantity } = basketRequest;

      // -> Validate user
      console.log("1");
      const isValidUser = await this.validateUser(userId);
      if (!isValidUser) {
        return new ServiceMessage(false, "User is invalid");
      }

      // -> Validate and get product details
      const productValid = await this.validateAndGetProduct(productId);
      if (!productValid) {
        return new ServiceMessage(false, "Product is invalid or unavailable");
      }

      // -> Validate quantity
      if (productValid.quantity < quantity) {
        return new ServiceMessage(false, "Insufficient stock");
      }

      // -> Get or create basket
      const existingBasket = await this.basketRepository.getBasket(userId);
      const basket = existingBasket
        ? new BasketDto(
            existingBasket.userId,
            existingBasket.basketItems,
            existingBasket.totalPrice,
            existingBasket.createdAt,
            existingBasket.updateAt
          )
        : new BasketDto(userId, [], 0, new Date(), new Date());

      // -> Update basket items
      this.updateBasketItems(
        basket as BasketDto,
        productValid as BasketItemDto,
        quantity
      );

      // -> Save updated basket
      await this.basketRepository.saveBasket(basket, this.BASKET_TTL);

      return new ServiceMessage(true, "Basket updated successfully", basket);
    } catch (error) {
      logger.error("[Basket Service - saveBasket]", error);
      return new ServiceMessage(false, `Error saving basket: ${error}`);
    }
  }

  async deleteBasket(userId: string): Promise<ServiceMessage<void>> {
    try {
      await this.basketRepository.deleteBasket(userId);
      return new ServiceMessage(true, "Basket deleted successfully");
    } catch (error) {
      logger.error("[Basket Service - deleteBasket]", error);
      return new ServiceMessage(false, `Error deleting basket: ${error}`);
    }
  }

  private async validateUser(userId: string): Promise<boolean> {
    console.log("2");
    // -> Check Redis cache first
    const cachedUserValid = await this.userValidRepository.getUserValid(userId);

    if (cachedUserValid) {
      return cachedUserValid;
    }

    // -> Validate with Identity Service if not in cache
    try {
      const response = await axios.get(
        `${process.env.MONOLITH_URL || 'http://localhost:3000'}/user/valid/${userId}` // -> In docker 'monolith'
      );
      const isValid = response.status === 200 && response.data?.isAvailable;

      if (isValid) {
        await this.userValidRepository.saveUserValid(
          new UserValidDto(userId, true),
          this.USER_VALID_TTL
        );
        return isValid;
      }

      logger.error(
        `Identity service response ${response.status} | user isAvalable:${response.data.isAvailable}`
      );

      return isValid;
    } catch (error) {
      logger.error("Error validating user with Identity Service", error);
      return false;
    }
  }

  private async validateAndGetProduct(
    productId: string
  ): Promise<BasketItemDto | null> {
    // -> Check Redis cache first
    const cachedProduct = await this.basketItemRepository.getBasketItem(
      productId
    );

    if (cachedProduct) {
      return cachedProduct;
    }

    // -> Get product details from Product Service if not in cache
    try {
      const response = await axios.get(
        `${process.env.MONOLITH_URL || 'http://localhost:3000'}/products/${productId}` // -> In docker 'monolith'
      );

      if (response.status === 200) {
        const product = response.data;

        const productValid = new BasketItemDto(
          product._id,
          product.name,
          product.image.url,
          product.price,
          product.stock
        );

        await this.basketItemRepository.saveBasketItem(
          productValid,
          this.PRODUCT_VALID_TTL
        );

        return productValid;
      }

      logger.error(`Identity service response ${response.status}`);
      return null;
    } catch (error) {
      logger.error("Error validating product with Product Service", error);
      return null;
    }
  }

  private updateBasketItems(
    basket: BasketDto,
    product: BasketItemDto,
    quantity: number
  ): void {
    const existingItemIndex = basket.basketItems.findIndex(
      (item) => item.id === product.id
    );

    if (existingItemIndex >= 0) {
      // -> Update quantity if item exists
      basket.basketItems[existingItemIndex].quantity += quantity;
    } else {
      // -> Add new item if it doesnt exist
      const newItem: BasketItemDto = {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        quantity: quantity,
        price: product.price,
      };

      basket.basketItems.push(newItem);
    }

    // -> Update total price using the DTO's method
    basket.totalPrice = basket.calculateTotalPrice();
    basket.updateAt = new Date();
  }

  async removeProductFromBasket(
    userId: string,
    productId: string
  ): Promise<ServiceMessage<BasketDto>> {
    try {
      // -> Get the existing basket
      const existingBasket = await this.basketRepository.getBasket(userId);

      if (!existingBasket) {
        return new ServiceMessage(false, "Basket not found");
      }

      const basket = new BasketDto(
        existingBasket.userId,
        existingBasket.basketItems,
        existingBasket.totalPrice,
        existingBasket.createdAt,
        existingBasket.updateAt
      );

      // -> Find the product in the basket
      const productIndex = basket.basketItems.findIndex(
        (item) => item.id === productId
      );

      if (productIndex === -1) {
        return new ServiceMessage(false, "Product not found in basket");
      }

      // -> Remove the product from the basket
      basket.basketItems.splice(productIndex, 1);

      // -> Update total price and timestamp
      basket.totalPrice = basket.calculateTotalPrice();
      basket.updateAt = new Date();

      // -> Save updated basket to repository
      await this.basketRepository.saveBasket(basket, this.BASKET_TTL);

      return new ServiceMessage(
        true,
        "Product removed from basket successfully",
        basket
      );
    } catch (error) {
      logger.error("[Basket Service - removeProductFromBasket]", error);
      return new ServiceMessage(
        false,
        `Error removing product from basket: ${error}`
      );
    }
  }
}
