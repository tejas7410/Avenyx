// ******* I created this for typescript global settings *******

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      file?: Multer.File;
    }
  }
}