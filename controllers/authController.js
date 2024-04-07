require('dotenv').config
const db = require('../models')
const User = db.users
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const generateToken = (payload) => {
    return jwt.sign(payload,process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const signup = catchAsync(async(req,res,next) => {

        const info = {
            fullname: req.body.fullname,
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password,10)
        }

        if(!info){
            return next(new AppError('fail to get req body',400))
            // return res.status(400).json({
            //     status:'signup fail',
            //     message:'fail to get req body'
            // })
        }
        
        const user = await User.create(info)

        if(!user){
            return next(new AppError('fail to create the user',400))
            // return res.status(400).json({
            //     status:'signup fail',
            //     message:'fail to create the user'
            // })
        }

        // const token = generateToken({
        //     id: user.id
        // })

        return res.status(201).json({
            status: 'signup success',
            data:{
                username: user.username
            }
        })
    }
)

const login = catchAsync(async (req,res,next) => {

        const {email,password} = req.body
        
        if(!email || !password){
            return next(new AppError('fail to get req body',400))
            // return res.status(400).json({
            //     status:'login fail',
            //     message:'fail to get req body'
            // })
        }

        const user = await User.findOne({where: {email}})
        if(!user || !(await bcrypt.compare(password, user.password))){
            return next(new AppError('Incorrect email or password',401))
            // return res.status(401).json({
            //     status:'login fail',
            //     message:'Incorrect email or password'
            // })
        }

        const token = generateToken({
            id: user.id
        })

        return res.status(200).json({
            status: 'login success',
            data:{
                username: user.username,
                token
            }
        })
    }
)

module.exports = {signup,login}