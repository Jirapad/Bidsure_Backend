const catchAsync = require("../utils/catchAsync");
const db = require('../models');
const AppError = require("../utils/appError");
const { Op } = require("sequelize");
const Transection = db.transections
const createTransection = catchAsync(async(req,res,next)=>{
    const body = req.body
    const userId = req.user.id
    const transection = {
        auctionId : body.auctionId,
        sellerId : userId,
        buyerId: body.buyerId,
        price: body.price,
        time: body.time
    }
    const result = await Transection.create(transection)
    if(!result){
        return next(new AppError("fail to create transection",400))
    }
    return res.status(201).json({
        status: 'make transection success',
        data:{
            result
        }
    })
})

const getAllTransection = catchAsync(async(req,res,next)=>{
    const userId = req.user.id
    // const transection = await Transection.findAll({
    //     where:{
    //         [Op.or]:[{buyer:userId},{seller:userId}]
    //     }
    // })
    // if(!transection){
    //     return next(new AppError("fail to get transection",400))
    // }
    const buyer = await Transection.findAll({where:{buyerId:userId}})
    if(!buyer){
        return next(new AppError("fail to get buyer transection",400))
    }
    const seller = await Transection.findAll({where:{sellerId:userId}})
    if(!seller){
        return next(new AppError("fail to get buyer transection",400))
    }
    return res.status(200).json({
        status:"success",
        buyer: buyer,
        seller: seller
    })
})

module.exports = {createTransection}