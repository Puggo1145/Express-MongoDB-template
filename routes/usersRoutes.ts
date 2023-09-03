import express from 'express';

import { updateMe, uploadUserPhoto } from '../controllers/userController'
import { signup, login, forgotPassword, resetPassword, chekcLoginStatus } from '../controllers/authController';
import { bodyChecker } from '../utilities/bodyChecker';
import { bodyFilter } from '../utilities/bodyFilter';



// routes
const router = express.Router();

router.param('id', (req, res, next, val) => {
    next();
})

router.post('/signup', bodyChecker(["name", "email", "password"]), signup);
router.post('/login', login);
router.post('/forgotpassword', bodyChecker(["email"]), forgotPassword); // 接收重设密码请求
router.post('/resetpassword', resetPassword); // 通过邮件接收重设的密码信息并验证
router.patch('/updateme', chekcLoginStatus, uploadUserPhoto, bodyFilter(["name", "email", "photo"]), updateMe);


export default router