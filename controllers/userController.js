const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const db = require('../models')
const User = db.users
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

const deleteUserImage = async(fullpath) => {
    await fs.unlink(fullpath,(err)=>{
        if(err){
            return next(new AppError('fail to delete old user image',400))
        }else{
            return true
        }
    })
}

const getAllUsername = catchAsync(async(req,res,next)=>{
    const userId = req.user.id
    const allUsername = await User.findAll()
    if(!allUsername){
        return next(new AppError('fail to get user data',400))
    }
    var userIdAndName = []
    for(i in allUsername){
        var user = {}
        user.id = allUsername[i].dataValues.id
        user.fullname = allUsername[i].dataValues.fullname
        user.username = allUsername[i].dataValues.username
        user.image = allUsername[i].dataValues.image
        user.bio = allUsername[i].dataValues.bio
        if(user.id != userId){
            userIdAndName.push(user)
        }
    }
    return res.status(200).json({
        status:'all user id and username',
        data: userIdAndName
    })
})

const getUserProfile = catchAsync(async(req,res,next) => {
    const userInfo = req.user
    if(!userInfo){
        return next(new AppError('Can not get user from token',400))
    }
    return res.status(200).json({
        fullname: userInfo.fullname,
        username: userInfo.username,
        image: userInfo.image,
        bio: userInfo.bio
    })
})

const updateUserFullname = catchAsync(async(req,res,next)=>{
    const userId = req.user.id
    const updateFullname = req.body.fullname
    const rowsUpdated = await User.update({
        fullname: updateFullname 
        },{
            where:{
                id: userId
            }
        })
    if(rowsUpdated.length===1){
        return res.status(200).json({
            status: `fullname changed`,
        })
    }
    return next(new AppError('cannot change fullname',400))
})

const updateUserImage = catchAsync(async(req,res,next)=>{
    var dlt = ''
    const userInfo = req.user
    const image = req.file
    if(userInfo.image != null){
        const imagePath = path.join(__dirname,'..','uploads')
        const fullImagepath = `${imagePath}${userInfo.image}`
        deleteUserImage(fullImagepath)
        dlt = 'delete old image, '
    }
    const rowsUpdated = await User.update({
        image: (image.path).split('/uploads')[1]
        },{
            where:{
                id: userInfo.id
            }
        })
    if(rowsUpdated.length===1){
        return res.status(200).json({
            status: `${dlt}image changed`,
        })
    }
    return next(new AppError('cannot change image',400))
})

const updateUserBio = catchAsync(async(req,res,next)=>{
    const userId = req.user.id
    const bio = req.body.bio
    const rowsUpdated = await User.update({
        bio: bio 
        },{
            where:{
                id: userId
            }
        })
    if(rowsUpdated.length===1){
        return res.status(200).json({
            status: `bio changed`,
        })
    }
    return next(new AppError('cannot change bio',400))
})

const changePassword = catchAsync(async(req,res,next)=>{
    const user = req.user
    const password = req.body
    if(!(await bcrypt.compare(password.currentPassword, user.password))){
        return next(new AppError('Incorrect password',401))
    }
    const rowsUpdated = await User.update({
        password: bcrypt.hashSync(password.newPassword,10)
    },{
        where:{
            id: user.id
        }
    })
    if(rowsUpdated.length===1){
        return res.status(200).json({
            status: `password changed`,
        })
    }
    return next(new AppError('can not change password',400))

})

const follow = catchAsync(async(req,res,next)=>{
    const {follow} = req.body
    var {id,following} = req.user
    if(following === null){
        following = [`${follow}`]
    }else{
        following.push(`${follow}`)
    }
    console.log(following)
    const rowsUpdated = await User.update({
        following: following
    },{
        where:{
            id: id
        }
    })
    if(rowsUpdated.length===1){
        return res.status(200).json({
            status: `following success ${follow}`,
        })
    }
    return next(new AppError(`fail to following`,400))
})

const unfollow = catchAsync(async(req,res,next)=>{
    const {unfollow} = req.body
    var {id,following} = req.user
    for(i in following){
        if(following[i]===`${unfollow}`){
            (following).splice(i, 1)
        }
    }
    const rowsUpdated = await User.update({
        following: following
    },{
        where:{
            id: id
        }
    })
    if(rowsUpdated.length===1){
        return res.status(200).json({
            status: `unfollow success`,
        })
    }
    return next(new AppError('fail to unfollow',400))
})

const getFollowing = catchAsync(async(req,res,next)=>{
    const userFollowing = req.user.following
    return res.status(200).json({
        userFollowing
    })
})

module.exports = {getUserProfile,updateUserFullname,updateUserImage,changePassword,getAllUsername,updateUserBio,follow,unfollow,getFollowing}