import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv'; // process.env 环境变量配置
import { rateLimit } from 'express-rate-limit'; // 速率限制
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize'; // 防 NoSQL 注入
// @ts-ignore
import xss from 'xss-clean'; // 防止 xss 攻击。由于缺失 ts 类型，所以 ignore 类型检查
import hpp from 'hpp';
import compression from 'compression' // 压缩 JSON 和 HTML 文本

// CORS
import cors from 'cors';

// 路由 router
import userRouter from './routes/usersRoutes'

// 全局异常处理逻辑
import { globalErrorHandler } from './controllers/errorHandler';

// 全局错误类 - AppError
import AppError from './utilities/appErrorClass';


// 应用环境变量配置
dotenv.config({path: './config.env'});



// EXPRESS ////////////////////////////////////////////////////////////////////////////////////////////////////
// create app
const app = express();



// middleware ////////////////////////////////////////////////////////////////////////////////////////////////////
// development env middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')) // 打印请求
}

// production env middleware
// CORS
app.use(cors());
app.options('*', cors());

// helmet
app.use(helmet());

// rate limiter
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: "too many requests at one time, please try again later."
});
app.use('/api', limiter);

// 读取 json
app.use(express.json()); 

// NoSQL query 清洗
app.use(mongoSanitize());
// XSS 清洗
app.use(xss());
// hpp
app.use(hpp({
    whitelist: ["duration"]
}));
// compression
app.use(compression());



// APIs routes ////////////////////////////////////////////////////////////////////////////////////////////////
app.use('/api/v1/users', userRouter)



// 异常处理 ////////////////////////////////////////////////////////////////////////////////////////////////////
// 处理不存在的路由
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find route named: ${req.url}`, 404));
});

// 全局异常处理
app.use(globalErrorHandler);




// SERVER ////////////////////////////////////////////////////////////////////////////////////////////////////

// 数据库 ////////////////////////////////////////////////////////////////////////////////////////////////////
// 连接数据库
const databaseUrl = process.env.DATABASE_LOCAL
if (databaseUrl) {
    mongoose.connect(databaseUrl)
    .then(() => {
        console.log("database connect successful");
    }).catch(err => {
        console.log(`connection failed \n ${err}`);
    })
} else {
    console.log(`Database Error, Can't find url: ${databaseUrl}`);
}



// 启动 server ////////////////////////////////////////////////////////////////////////////////////////////////////
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`server is listening on ${port}`);
});