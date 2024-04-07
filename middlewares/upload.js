const multer  = require('multer')
//const AppError = require('../utils/appError')
const path = require('path')

// const imageFilter = (req, file, cb) => {
//     if(file.mimetype.startsWith("image")){
//         cb(null,true)
//     }else{
//         cb("Please upload only images",false)
//         //cb(new AppError('Please upload only images',400))
//     }
// }

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        var imagesDir
        if(file.fieldname==='auctionImages'){
            imagesDir = path.join(__dirname,'..','uploads', 'auctionImages')
        }else{
            imagesDir = path.join(__dirname,'..', 'uploads', 'userImages')
        }
        console.log('Destination directory:', imagesDir);
        cb(null,imagesDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + (file.originalname).replaceAll(' ','-'))
    }
})

// const storageAuction = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const auctionImagesDir = path.join(__dirname,'..','uploads', 'auctionImages');
//         cb(null, auctionImagesDir)
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, uniqueSuffix + '-' + file.originalname)
//     }
// })

// const storageUser = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const userImagesDir = path.join(__dirname,'..', 'uploads', 'userImages');
//         cb(null, userImagesDir)
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, uniqueSuffix + '-' + file.originalname)
//     }
// })

//const upload = multer({storage:storage, fileFilter:imageFilter})
const upload = multer({storage:storage})

module.exports = {upload}