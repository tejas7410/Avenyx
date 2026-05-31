import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler";

export const requireRole = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const userRole = user?.role === "user" ? "buyer" : user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied for this role" });
    }

    next();
  });
