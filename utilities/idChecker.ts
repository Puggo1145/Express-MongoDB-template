import { RequestHandler } from "express";
import AppError from "./appErrorClass";

export const idChecker = (model: any): RequestHandler => {
    return async (req, res, next) => {
        try {
            const isTourExists = await model.exists({ _id: req.params.tourId })

            if (!isTourExists) {
                return next(new AppError("The tour doesn't exist", 404));
            }
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'name' in err) {
                if (err.name === 'CastError') {            
                    return next(new AppError("Invalid tour id", 404));
                }
            }
        }
    };
};