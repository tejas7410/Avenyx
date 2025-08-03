// ******* Error Handler Middleware **********

import { Request, Response, NextFunction } from "express";
import {logger, getCallerLocation} from "../../config/logger"; // Adjust this to the correct path

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    const errorLocation =  getCallerLocation();

    logger.error(err.message, {
        stack: err.stack, 
        request: {
            method: req.method,
            url: req.url,
        },
        location: errorLocation, 
    });

    res.status(500).json({
        message: "Something went wrong, please try again later.",
    });
};


export default errorHandler;
