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
    const auctionDetail = req.body
    const auctionImage = req.files
    
    auctionDetail.images = []
    for(i in auctionImage){
        (auctionDetail.images).push(
            (auctionImage[i].path).split('/uploads')[1])
    }
    auctionDetail.host = userId
    const auction = await Auction.create(auctionDetail)
    if(!auction){
        return next(new AppError('can not create auction',400))
    }
    return res.status(201).json({
        status: 'auction created',
        auction
    })
})

const getAllAuction = catchAsync(async(req,res,next)=>{
    const allAuction = await Auction.findAll({include: User}) //not sure yet for include method
    if(!allAuction){
        return next(new AppError('fail to get all auction',400))
    }
    return res.status(200).json({
        status: 'success! get all auction',
        data: allAuction
    })
})

const deleteAuction = catchAsync(async(req,res,next)=>{
    const userId = req.user.id
    const deleteAuction = await Auction.FindOneAndDelete({host:userId})
    //if(!deleteAuction){return next(new AppError('fail to delete aution',400))}
    //const path = path.join(__dirname,'..','uploads', 'auctionImages')
    for(i in deleteAuction.images){
        if(!(await fs.unlink(`${path}${deleteAuction.images[i]}`))){
            return next(new AppError('fail to delete aution image',400))
        }
    }
    //return res.status(200).json({delete})
})

module.exports = {createAuction,getAllAuction}