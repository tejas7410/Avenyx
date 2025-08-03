import { Router, Request, Response } from "express";
import { container } from "../../../config/inversify";
import { UserController } from "../controllers/UserController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "../middlewares/asyncHandler";

// -> For getting payload for typescript
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; 
    }
  }
}

const UserRouter = Router();

const userController = container.get(UserController);

UserRouter.get(
  "/profile",authenticateToken,
  asyncHandler((req: Request, res: Response) =>
    userController.getProfile(req, res)
  )
);

UserRouter.put(
  "/profile/:id",authenticateToken,
  asyncHandler((req: Request, res: Response) =>
    userController.updateProfile(req, res)
  )
);

UserRouter.delete(
  "/:id",authenticateToken,
  asyncHandler((req: Request, res: Response) =>
    userController.deleteUser(req, res)
  )
);

UserRouter.get(
  "/valid/:id",
  asyncHandler((req: Request, res: Response) => userController.userValid(req, res))
);

export default UserRouter;
