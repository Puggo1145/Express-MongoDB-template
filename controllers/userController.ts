import { RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';

import AppError from '../utilities/appErrorClass';

import User from '../models/userModel';


// form data handler
// 配置 multer 处理文件的行为
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1]; // 文件扩展名 
        cb(null, `user-${Date.now()}.${ext}`);
    }
})

const multerFilter = (req: Express.Request, file: Express.Multer.File , cb: FileFilterCallback) => {
    if ( file.mimetype.startsWith('image') ) {
        cb(null, true);
    } else {
        //@ts-ignore
        cb(new AppError("Not an image! Please upload only images", 400), false); // 这里的 multer 类型有问题，忽略检查
    }
};

// 创建 multer
const upload = multer({ 
    storage: multerStorage,
    fileFilter: multerFilter
 });

export const uploadUserPhoto = upload.single('photo');


// api functions
export const getUser: RequestHandler = (req, res) => {
    res.status(500).json({
        status: "Internal Server Error",
        data: "Relevant Functions haven't been established"
    })
};

interface filteredObjType {
    name?: string
    email?: string
    [key: string]: string | undefined
}

export const updateMe: RequestHandler = async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(res.locals.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: "success",
            data: {
                updatedUser: updatedUser
            }
        });

    } catch (err) {
        return next(new AppError("UpdateMe internal function error", 500));
    };
};
