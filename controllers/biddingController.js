const catchAsync = require("../utils/catchAsync");
const db = require('../models');
const AppError = require("../utils/appError");
const { all } = require("../routes/authRoute");
const Bidding = db.biddings
const User = db.users
const Auction = db.auctions


const createBidding = catchAsync(async(req,res,next)=>{
    const user = req.user
    const body = req.body
    const bidding = {
        userId : user.id,
        time : new Date().toISOString(),
        price : body.price,
        auctionId : parseInt(body.id)
    }
    const result = await Bidding.create(bidding)
    if(!result){
        return next(new AppError("can not create bidding",400))
    }
    return res.status(201).json({
        status: "created bidding success",
        result
    })
})

const getHighestBid = catchAsync(async(req,res,next)=>{
    const auctionId = req.body.auctionId
    const auction = await Auction.findByPk(auctionId)
    let highest = auction.startingPrice
    let bidId
    let time
    let result
    const allBidInAuction = await Bidding.findAll({where:{auctionId:auctionId}})
    if(!allBidInAuction){
        return res.status(200).json({
            startingPrice :highest
        })
    }
    for(i in allBidInAuction){
        if(allBidInAuction[i].price>highest){
            bidId = allBidInAuction[i].id
            highest = allBidInAuction[i].price
            time = allBidInAuction[i].time
            result = allBidInAuction[i]
        }else if(allBidInAuction[i].price===highest){
            const currentDate = new Date().toISOString
            const difference1 = Math.abs(currentDate - time)
            const difference2 = Math.abs(currentDate - allBidInAuction[i].time)
            if (difference2 < difference1) {
                bidId = allBidInAuction[i].id
                highest = allBidInAuction[i].price
                time = allBidInAuction[i].time
                result = allBidInAuction[i]
            }
        }
    }
    return res.status(200).json({
        result
    })
})

module.exports = {createBidding,getHighestBid}