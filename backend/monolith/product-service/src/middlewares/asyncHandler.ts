import { Request, Response, NextFunction } from "express";

// -> Created middleware for typescript exppress async
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  
  return (req: Request, res: Response, next: NextFunction) => {
   
    Promise.resolve(fn(req, res, next)).catch(next);
    
  };
}