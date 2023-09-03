import { ErrorRequestHandler, RequestHandler } from 'express';

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Internal Server Error"

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errStack: err.isProduction ? '' : err.stack
    });

    next();
};

process.on('unhandledRejection', (err: Error) => {
    console.log(err.name, err.message);

    if (err.name === 'MongoServerError') {
        console.log("severity: low");
    } else {
        process.exit(1);
    }

});

process.on('uncaughtException', (err: Error) => {
    console.log(err.name, err.message);

    process.exit(1);
});