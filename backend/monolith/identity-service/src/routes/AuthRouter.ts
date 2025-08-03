import { Router, Request, Response } from "express";
import { container } from "../../../config/inversify";
import { AuthController } from "../controllers/AuthController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { authenticateToken } from "../middlewares/authMiddleware";

const AuthRouter = Router();

// -> AuthController from DI container
const authController = container.get(AuthController);

// -> Routes
AuthRouter.post(
  "/register",
  asyncHandler((req: Request, res: Response) => authController.register(req, res))
);

AuthRouter.post(
  "/login",
  asyncHandler((req: Request, res: Response) => authController.login(req, res))
);

AuthRouter.post(
  "/logout",authenticateToken,
  asyncHandler((req: Request, res: Response) => authController.logout(req, res))
);

export default AuthRouter;
