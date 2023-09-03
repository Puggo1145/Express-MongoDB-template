import { RequestHandler } from "express";
import AppError from "./appErrorClass";

// 过滤 body 的字段
export const bodyFilter = (allowedFields: string[]): RequestHandler => {
    return (req, res, next) => {
        // 放行允许字段
        const newObj: { [key: string]: unknown }= {};
        Object.keys(req.body).forEach(item => {
            if (allowedFields.includes(item)) newObj[item] = req.body[item]
        });  

        // 空 body 检查
        if (JSON.stringify(newObj) === '{}') return next(new AppError("please provide valid data", 400));

        req.body = newObj; // 将过滤后的对象分配给 body

        next();
    };
};