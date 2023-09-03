export default class AppError extends Error {
    statusCode: number
    status: string
    isProduction: boolean
    stack: string | undefined;

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'Internal Server Error';
        this.isProduction = process.env.NODE_ENV === 'production' // 生产环境不报详细错误信息
        this.stack = this.stack
    }
}