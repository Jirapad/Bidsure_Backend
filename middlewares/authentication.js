const AppError = require("../utils/appError")
const jwt = require('jsonwebtoken')
const catchAsync = require("../utils/catchAsync")
const db = require('../models')
const User = db.users

const authentication = catchAsync(async(req,res,next) => {
        var idToken
        if(
            req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ){
            idToken = (req.headers.authorization).split(' ')[1]
        }
        if(!idToken){
            return next(new AppError('Please login to get access',401))
        }
        const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY)

        const freshUser = await User.findByPk(tokenDetail.id)

        if(!freshUser){
            return next(new AppError('User no longer exists',401))
        }

        req.user = freshUser
        return next()
    }
)

module.exports = {authentication}