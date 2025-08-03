// -> Created for jwt auth, getting token from header and check

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { container } from "../../../config/inversify";
import { asyncHandler } from "./asyncHandler";
import { IIdentityRedisService } from "../../infrastructure/redis/IIdentityRedisService";

export const authenticateToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;

      const redisService =
        container.get<IIdentityRedisService>("IIdentityRedisService");

      // -> Verify token exists in Redis
      const cachedToken = await redisService.getToken(decoded.id);

      if (!cachedToken || cachedToken !== token) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.user = decoded;

      next();

    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
);
