const catchAsync = require("../utils/catchAsync");
const db = require('../models');
const AppError = require("../utils/appError");
const Auction = db.auctions
const fs = require('fs')
const User = db.users

// const createAuction = catchAsync(async (req,res,next)=> {

//     //get from jwt
//     const userId = req.user.id

//     const infof = req.files
//     const info = req.body

//     console.log(req.body)
//     console.log(info)
//     console.log(req.files[0])
//     console.log((req.files[0].path).split('/uploads')[1])
//     console.log(infof)

//     console.log(`this is second image \n`+infof[1])

    
// })

const createAuction = catchAsync(async(req,res,next)=>{
    const userId = req.user.id
    const body = req.body
    const auctionImage = req.files
    body.images = []
    for(i in auctionImage){
        (body.images).push(
            (auctionImage[i].path).split('/uploads')[1])
    }

    let currentTime = new Date()
    const endTimeMilliseconds = currentTime.setHours(currentTime.getHours() + parseInt(body.endTime))
    const endTime = new Date(endTimeMilliseconds).toISOString();

    const auctionDetail = {
        name : body.name,
        description : body.description,
        startingPrice: body.startingPrice,
        minBid: body.minBid,
        mode : body.mode,
        endTime: endTime,
        host : userId,
        images : body.images
    }
    
    const auction = await Auction.create(auctionDetail)
    if(!auction){
        return next(new AppError('can not create auction',400))
    }
    if(auction.mode === 'live'){
        return res.status(201).json({
            status: 'auction created',
            auction,
            rtmpLink: `/live/${auction.id}`,
            watchLink: `/live/${auction.id}/index.m3u8`
        })
    }
    return res.status(201).json({
        status: 'auction created',
        auction
    })
})

const getAllAuction = catchAsync(async(req,res,next)=>{
    const allOnlineAuction = await Auction.findAll({
        where:{mode:"online"},
        include: User
    }) 
    if(!allOnlineAuction){
        return next(new AppError('fail to get all online auction',400))
    }
    const allLiveAuction = await Auction.findAll({
        where:{mode:"live"},
        include: User
    }) 
    if(!allLiveAuction){
        return next(new AppError('fail to get all live auction',400))
    }
    return res.status(200).json({
        status: 'success! get all auction',
        online: allOnlineAuction,
        live: allLiveAuction
    })
})

const deleteAuction = catchAsync(async(req,res,next)=>{
    const auctionId = req.body.auctionId
    const deleteAuction = await Auction.FindOneAndDelete({id:auctionId})
    if(!deleteAuction){
        return next(new AppError('fail to delete aution',400))
    }
    const path = path.join(__dirname,'..','uploads')
    for(i in deleteAuction.images){
        if(!(await fs.unlink(`${path}${deleteAuction.images[i]}`))){
            return next(new AppError('fail to delete aution image',400))
        }
    }
    return res.status(200).json({
        status:"auction deleted"
    })
})

const getFollowingAuction = catchAsync(async(req,res,next)=>{
    const userFollowing = req.user.following
    let auctionOnlineList = []
    let auctionLiveList = []
    for(i in userFollowing){
        const onlineAuction = await Auction.findAll({
            where:{host:parseInt(userFollowing[i]),mode:"online"},
            include: User
        })
        if(!onlineAuction){
            return next(new AppError('fail to get online aution list',400))
        }

        const liveAuction = await Auction.findAll({
            where:{host:parseInt(userFollowing[i]),mode:"live"},
            include: User
        })
        if(!liveAuction){
            return next(new AppError('fail to get live aution list',400))
        }
        auctionOnlineList.push(onlineAuction)
        auctionLiveList.push(liveAuction)
    }
    return res.status(200).json({
        auctionOnlineList,
        auctionLiveList
    })
})

const getOneAuction = catchAsync(async(req,res,next)=>{
    const auctionId = req.body.auctionId
    const info = await Auction.findByPk(auctionId)
    if(!info){
        return next(new AppError("fail to get auction",400))
    }
    return res.status(200).json({
        status:'success',
        data: info
    })
})

module.exports = {createAuction,getAllAuction,getFollowingAuction,deleteAuction,getOneAuction}