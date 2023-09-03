import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'

import User from "../models/userModel";

// types
import { RequestHandler } from "express";
import { decodedTokenDataType } from '../types/types';

// custom class
import AppError from "../utilities/appErrorClass";

// 签发 token
const signToken = (userid: string) => {
    return jwt.sign({ id: userid }, process.env.JWT_SECRETKEY as string, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}



// 用户注册
export const signup: RequestHandler = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        // 获取 jwt token
        const token = signToken(newUser._id.toString());
        
        // 以 cookie 形式发送 jwt
        res.cookie('jwt', token, {
            expires: new Date(
                Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
            ),
            secure: process.env.NODE_ENV === 'production', // 只在 https 传输 cookie，且仅应用于生产环境
            httpOnly: true // 防止跨站脚本攻击
        }); 
        

        res.status(201).json({
            status: "success",
            token: token,
            data: {
                userInfo: newUser
            }
        })
    } catch (err) {
        next(new AppError("Signup Internal function error: user create failed", 400));
    }
};

// 登录
export const login: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1. 检查 email 和 password 是否存在
        if (!email || !password) {
            return next(new AppError("email or password missed", 401));
        };

        // 2. 检查用户是否存在及其密码是否正确
        const user = await User.findOne({ email: email }).select('+password')

        // 用户不存在
        if (!user) {
            return next(new AppError("Invalid email or password", 401));
        }
        // 检查密码是否正确
        else if (!await bcrypt.compare(password, user.password as string)) {
            return next(new AppError("Invalid email or password", 401));
        } // 返回一样的错误信息是为了混淆攻击者
        
        // 3. 一切顺利，签发令牌
        const token = signToken(user._id.toString());

        // 以 cookie 形式发送 jwt
        res.cookie('jwt', token, {
            expires: new Date(
                Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
            ),
            secure: process.env.NODE_ENV === 'production', // 只在 https 传输 cookie，且仅应用于生产环境
            httpOnly: true // 防止跨站脚本攻击
        }); 

        res.status(200).json({
            status: "success",
            token: token,
            message: `Hi! ${user.name}. You've successfully signed in!`
        });


    } catch (err) {
        next(new AppError("login Internal function error: user login error", 400));
    }
};


// 忘记密码
export const forgotPassword: RequestHandler = async (req, res, next) => {
    try {
        // 检查 body
        if (!req.body.email) return next(new AppError("please provice email", 400));

        // 1. 根据 email 获取 user
        const user = await User.findOne({ email: req.body.email });
        // 如果 user 不存在
        if (!user) {
            return next(new AppError("invalid email, please check your email", 404));
        }

        // 2. 生成随机 token 用于验证
        let resetToken = "xsadcacdacs";
        resetToken = await bcrypt.hash(resetToken, 8);

        // 3. 将 token 存储进用户数据中，并设定 token 有效期
        await user.updateOne({ pwdResetToken: resetToken });
        await user.updateOne({ pwdResetExpires: Date.now() + 10 * 60 * 1000 });

        console.log(user.pwdResetToken, user.pwdResetExpires);

        res.status(200).json({
            status: "success",
            message: "reset request has been approved",
            data: {
                resetToken: resetToken
            }
        })

    } catch (err) {
        return next(new AppError("forgotPassword function error", 400))
    }
};

export const resetPassword: RequestHandler = async (req, res, next) => {

};

// middlewares ////////////////////////////////////////////////////////////
// 检查登录状态
export const chekcLoginStatus: RequestHandler = async (req, res, next) => {
    try {
        // 1. 获取 token
        let token: string = '';
        if (req.headers.authorization) {
            token = req.headers.authorization;
        };
        // 如果 token 不存在
        if (token === '') {
            return next(new AppError("Please log in first", 401));
        }

        // 2. 验证 token
        const decodedTokenData = jwt.verify(token, process.env.JWT_SECRETKEY as string) as decodedTokenDataType;

        // 3. 验证用户是否还存在
        const freshuser = await User.findById({ _id: decodedTokenData.id })
        if (!freshuser) {
            return next(new AppError("User not exist, please relogin", 401));
        }

        // 4. 验证密码是否在 token 签发后更改
        //  如果用户更改过密码，就会记录上一次修改密码的时间
        if (freshuser.pwdChangedAt) {
            // 比较上一次修改密码的时间 和 token 签发的时间，如果修改密码的时间晚于(大于) token 签发的时间，则表示密码在 token 签发后被更改
            if (freshuser.pwdChangedAt?.getTime() / 1000 > decodedTokenData.iat) {
                return next(new AppError("password has been changed. Please relogin", 401));
            }
        }

        res.locals = freshuser // 使用 res.locals 在中间件之间传递信息
        next();
    } catch (err: any) {
        if (err.name === 'JsonWebTokenError') {
            return next(new AppError("Invalid token, please log in again!", 401));
        } else if (err.name === 'TokenExpiredError') {
            return next(new AppError("token expired, please log in again!", 401));
        }
        next(new AppError("checkLoginStatus function error", 400));
    }
};

// 用户鉴权
export const roleRestriction = (roles: string[]): RequestHandler => {
    return (req, res, next) => {
        if (!roles.includes(res.locals.role)) {
            return next(new AppError(`permission denied: ${res.locals.role}`, 401))
        }

        next();
    }
}