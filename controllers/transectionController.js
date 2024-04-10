const catchAsync = require("../utils/catchAsync");
const db = require('../models');
const AppError = require("../utils/appError");
const { Op } = require("sequelize");
const Transection = db.transections
const Bidding = db.biddings
const Auction = db.auctions
const User = db.users

const createTransection = catchAsync(async(req,res,next)=>{
    const winBidId = parseInt(req.body.winBidId)
    const bidInfo = await Bidding.findByPk(winBidId)
    if(!bidInfo){
        return next(new AppError("fail to get win bidding",400))
    }
    console.log(bidInfo)
    const aid = parseInt(bidInfo.auctionId)
    console.log(aid)
    const auctionInfo = await Auction.findByPk(aid)
    if(!auctionInfo){
        return next(new AppError("fail to get auction info",400))
    }
    const transection = {
        auctionId : bidInfo.auctionId,
        sellerId : auctionInfo.host,
        buyerId: bidInfo.userId,
        price: parseFloat(bidInfo.price),
        time: bidInfo.time
    }
    const result = await Transection.create(transection)
    if(!result){
        return next(new AppError("fail to create transection",400))
    }
    const user2 = await User.findByPk(auctionInfo.host)
    const newBalance2 = user2.walletBalance+parseFloat(result.price)
    const updateWallet2 = await User.update({
        walletBalance: parseFloat(newBalance2)
    },{
        where:{
            id: user2.id
        }
    })
    const user = req.user
    const newBalance = parseFloat(user.walletBalance)-parseFloat(result.price)
    const updateWallet = await User.update({
        walletBalance: parseFloat(newBalance)
    },{
        where:{
            id: user.id
        }
    })
    return res.status(200).json({
        status: "success",
        result
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

module.exports = {createTransection,getAllTransection}