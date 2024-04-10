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
        time : new Date(),
        price : parseFloat(body.price),
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
    //let bidId
    //let time
    let result = { 
        id : null,
        price : `${highest}`,
        time : null,
    }
    // let result = null
    const allBidInAuction = await Bidding.findAll({where:{auctionId:auctionId}})
    // if(allBidInAuction===false){
    //     console.log['empty']
    //     return res.status(200).json({
    //         result
    //     })
    // }
    // console.log('before i')
    // console.log(allBidInAuction)
    for(let bid of allBidInAuction){
        // console.log(`${allBidInAuction[i].dataValues.price}`)
        const bidPrice = parseFloat(bid.price)
        // if(allBidInAuction[i].price>highest){
        //     bidId = allBidInAuction[i].id
        //     highest = allBidInAuction[i].price
        //     time = allBidInAuction[i].time
        //     result = allBidInAuction[i]
        //     // console.log('this')
        //     result.price = `${result.price}`
        //     const username = await User.findByPk(result.userId)
        //     result.dataValues.username = username.username
        if(bidPrice>highest){
            highest = bidPrice
            result = bid
        }else if(bidPrice===highest){
            const currentDate = new Date();
            const currentTimestamp = currentDate.getTime();
            const bidTimestamp = new Date(bid.time).getTime();
            const resultTimestamp = new Date(result.time).getTime();
            const diff1 = Math.abs(currentTimestamp-resultTimestamp)
            const diff2 = Math.abs(currentTimestamp-bidTimestamp)
            if(diff2<diff1){
                result = bid
            }
            // const currentDate = new Date().toISOString
            // const difference1 = Math.abs(currentDate - time)
            // const difference2 = Math.abs(currentDate - allBidInAuction[i].time)
            // if (difference2 < difference1) {
            //     bidId = allBidInAuction[i].id
            //     highest = allBidInAuction[i].price
            //     time = allBidInAuction[i].time
            //     result = allBidInAuction[i]
            // }
            // // console.log('that')
            // result.price = `${result.price}`
            // const username = await User.findByPk(result.userId)
            // result.dataValues.username = username.username
        }//else{
        //     return res.status(200).json({
        //         result
        //     })
        // }
        
    }
    if(result.time!=null){
        const username = await User.findByPk(result.userId);
        result.dataValues.username = username.username;
    }
    return res.status(200).json({
        result
    })
    // return res.status(200).json({
    //     result
    // })
})

module.exports = {createBidding,getHighestBid}