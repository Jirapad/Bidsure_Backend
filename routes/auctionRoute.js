const { createAuction, getAllAuction } = require('../controllers/auctionController')
const { authentication } = require('../middlewares/authentication')
const { upload } = require('../middlewares/upload')


const router = require('express').Router()

router.route('/').post(authentication,upload.array('auctionImages'),createAuction).get(authentication,getAllAuction)

module.exports = router