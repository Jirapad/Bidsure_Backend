require('dotenv').config()
const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()
const PORT = process.env.APP_PORT || 4000

app.use(express.json())
app.use(bodyParser.json())

const auctionImagesDir = path.join(__dirname, 'uploads', 'auctionImages');
const userImagesDir = path.join(__dirname, 'uploads', 'userImages');

if (!fs.existsSync(auctionImagesDir)) {
    fs.mkdirSync(auctionImagesDir, { recursive: true });
}

if (!fs.existsSync(userImagesDir)) {
    fs.mkdirSync(userImagesDir, { recursive: true });
}

app.use(express.static('uploads'))

const authRouter = require('./routes/authRoute')
const auctionRouter = require('./routes/auctionRoute')
const userRouter = require('./routes/userRoute')
const topupRouter = require('./routes/topupRoute')

const globalErrorHandler = require('./controllers/errorController')
const catchAsync = require('./utils/catchAsync')
const AppError = require('./utils/appError')

app.use('/auth',authRouter)
app.use('/auction',auctionRouter)
app.use('/user',userRouter)
app.use('/topup',topupRouter)

app.use(
    '*',
    catchAsync(async (req,res,next) => {
        //throw new AppError(`Can't find ${req.originalUrl} on this server`,404) 
        //this method can use with express(usually use next())) or other
        return next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
    })
)

app.use(globalErrorHandler)

/*
db.sequelize.sync({alter:true}).then(()=>{
    console.log('re-sync done!')
    app.listen(PORT,()=>{
        console.log(`server is running on port ${PORT}`)
    })
})
*/

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})
