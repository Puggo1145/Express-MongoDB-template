import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "user name missed"]
    },
    email: {
        type: String,
        required: [true, "email name missed"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'invalid email format']
    },
    photo: {
        type: String,
        default: "none"
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required:  [true, "password name missed"],
        minLength: [8, "Invalid password length"],
        select: false
    }, 
    pwdChangedAt: {
        type: Date,
        default:  "2000-01-01"
    },
    pwdResetToken: {
        type: String
    },
    pwdResetExpires: {
        type: Date
    }
});

// mongoose middleware
userSchema.pre('save', async function(next) {
    // 只有 password 被 modified 才运行此方法
    if (!this.isModified('password')) return next();

    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    };

    next();
})



const User = mongoose.model('User', userSchema);

export default User;