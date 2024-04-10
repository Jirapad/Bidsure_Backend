require('dotenv').config()
const catchAsync = require("../utils/catchAsync");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {v4: uuidv4} = require('uuid')
const db = require('../models');
const AppError = require('../utils/appError');
const Topup = db.topups
const User = db.users

const checkOut = catchAsync(async(req,res,next)=>{
    const user = req.user
    const body = req.body
    const orderId = uuidv4()
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
                price_data: {
                    currency: "thb",
                    product_data: {
                        name: user.username,
                    },
                    unit_amount: body.price * 100,
                },
                quantity: 1 ,
            },
        ],
        mode: "payment",
        success_url: `https://bidsure-backend.onrender.com/topup/getorder/${orderId}`,
    })
    const topupData = {
        userId: user.id,
        time: new Date(),
        price: body.price,
        orderId: orderId,
        sessionId: session.id,
        status: session.status
    }
    const createTopup = await Topup.create(topupData)
    if(!createTopup){
        return next(new AppError("fail to create topup",400))
    }
    return res.status(201).json({
        status:'topup created',
        data: createTopup,
        link: session.url
    })
})

const getOrderId = catchAsync(async(req,res,next)=>{
    const orderId = req.params.id
    const result = await Topup.findOne({where:{orderId}})
    const userwallet = await User.findOne({where:{id:result.userId}})
    let addwallet
    if(userwallet.walletBalance===null){
        addwallet = parseFloat(result.price)
    }else{
        addwallet = parseFloat(userwallet.walletBalance)+parseFloat(result.price)
    }
    const user = await User.update({
        walletBalance: parseFloat(addwallet)
    },{
        where:{
            id: result.userId
        }
    })
    if(!user){
        return next(new AppError("can not update wallet balance",400))
    }
    if(!result){
        return next(new AppError("can not find orderId",400))
    }
    return res.status(200).json({
        status: `Top-up amount ${result.price} Baht, Success!!, you can close this tap`
    })

})

const getWalletBalance = catchAsync(async(req,res,next)=>{
    const walletBalance = req.user.walletBalance
    if(walletBalance===null||walletBalance===0){
        return res.status(200).json({
            walletBalance: 0
        })
    }else{
        return res.status(200).json({
            walletBalance: walletBalance
        })
    }
})

const webhook = catchAsync(async(req,res,next)=>{
    const endpointSecret = process.env.WEBHOOK;
    const sig = req.headers['stripe-signature'];
    console.log(req.body)
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if(process.env.NODE_ENV==='development'){
        switch (event.type) {
            case 'checkout.session.completed':
                const paymentData = event.data.object;
                const sessionId = paymentData.id
                const setStatus = paymentData.status
                const rowsUpdated = await Topup.update({
                    status: setStatus 
                    },{
                        where:{
                            sessionId: sessionId
                        }
                    })
                if(rowsUpdated.length===1){
                    return res.status(200).json({
                        status: `complete`,
                    })
                }
                return next(new AppError('top up fail',400))
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }

    if(process.env.NODE_ENV==='production'){
        if(event.type==='checkout.session.completed'){
            const paymentData = event.data.object;
            console.log(paymentData)
                const sessionId = paymentData.id
                const setStatus = paymentData.status
                const rowsUpdated = await Topup.update({
                    status: setStatus
                    },{
                        where:{
                            sessionId: sessionId
                        }
                    })
                if(rowsUpdated.length===1){
                    return res.status(200).json({
                        status: `complete`,
                    })
                }
                return next(new AppError('failure',400))
        }else{
        // Handle the event
            console.log(`Unhandled event type ${event.type}`);
        }
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
})

module.exports = {checkOut, getOrderId,webhook,getWalletBalance}