import { RequestHandler } from "express";
import AppError from "./appErrorClass";

// 检查 body 是否缺失了必须提供的字段
export const bodyChecker = (fields: string[]): RequestHandler => {
    return (req, res, next) => {
        // 存储缺失字段
        let missingFields: string[] = [];

        // 遍历传入的需要检查的字段
        fields.forEach(field => {
            !req.body[field] && missingFields.push(field);
        })

        // 存在缺少的字段，抛出错误
        if (missingFields.length) {
            return next(new AppError(`Missing content: ${missingFields.join(', ')}. Please try again`, 400))
        }

        next();
    };
};