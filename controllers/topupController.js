require('dotenv').config()
const catchAsync = require("../utils/catchAsync");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {v4: uuidv4} = require('uuid')
const db = require('../models');
const AppError = require('../utils/appError');
const Topup = db.topups

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
    //return res.redirect(303, session.url)
})

const getOrderId = catchAsync(async(req,res,next)=>{
    const orderId = req.params.id
    const result = await Topup.findOne({where:{orderId}})
    if(!result){
        return next(new AppError("can not find orderId",400))
    }
    return res.status(200).json({
        status: "success",
        order: result
    })

})

const webhook = catchAsync(async(req,res,next)=>{
    const endpointSecret = process.env.WEBHOOK;
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        //const buf = Buffer.from(req.rawBody,'utf8')
        //const buf = Buffer.from(req.rawBody, 'utf8');
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        //event = stripe.webhooks.constructEvent(buf, sig, endpointSecret)
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

const captureRawBody = (req, res, next) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  };

module.exports = {checkOut, getOrderId,webhook,captureRawBody}