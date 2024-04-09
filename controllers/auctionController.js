const catchAsync = require("../utils/catchAsync");
const db = require('../models');
const AppError = require("../utils/appError");
const Auction = db.auctions
const fs = require('fs')
const User = db.users
const path = require('path')

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
        const rowsUpdated = await Auction.update({
            rtmpLink:`/live/${auction.id}`, 
            watchLink:`/live/${auction.id}/index.m3u8`
        },{
            where:{
                id : auction.id
            }
        })
        if(rowsUpdated.length===1){
            return res.status(201).json({
                status: `live auction created`,
                auction
            })
        }
        return next(new AppError('cannot add link in live auction',400))
    }else{
        return res.status(201).json({
            status: 'online auction created',
            auction
        })
    }
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
    const deleteAuction = await Auction.destroy({where:{id:auctionId,mode:"live"}})
    if(deleteAuction===0){
        return next(new AppError('fail to delete aution',400))
    }
    const paths = path.join(__dirname,'..','uploads')
    for(i in deleteAuction.images){
        if(!(await fs.unlink(`${paths}${deleteAuction.images[i]}`))){
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
    let info = await Auction.findByPk(auctionId)
    if(!info){
        return next(new AppError("fail to get auction",400))
    }
    if (info.endTime) {
        // Convert endTime to Thailand time zone
        const endTimeUTC = new Date(info.endTime);
        const thailandOffset = 7 * 60 * 60 * 1000; // Thailand is UTC+7
        const endTimeThailand = new Date(endTimeUTC.getTime() + thailandOffset);
        
        // Format the date and time in the desired way
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        };
        info.endTime = endTimeThailand.toLocaleString('en-US', options)
        info.endTime
    }
    console.log(info.endTime)
        return res.status(200).json({
            status:'success',
            data: info
    })
})

const getLiveAuctionInfo = catchAsync(async(req,res,next)=>{
    const userId = req.user.id
    const liveAuction = await Auction.findOne({where:{host:userId,mode:"live"}})
    if(!liveAuction){
        return next(new AppError("cannot get live auction info",400))
    }
    return res.status(200).json({
        info: liveAuction
    })
})

module.exports = {createAuction,getAllAuction,getFollowingAuction,deleteAuction,getOneAuction,getLiveAuctionInfo}