const router = require('express').Router()
const { createBidding, getHighestBid } = require('../controllers/biddingController')
const { authentication } = require('../middlewares/authentication')

router.route('/createbidding').post(authentication,createBidding)
router.route('/').post(getHighestBid)

module.exports = router