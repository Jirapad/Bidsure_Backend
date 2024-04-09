const { createAuction, getAllAuction, getFollowingAuction, deleteAuction, getOneAuction } = require('../controllers/auctionController')
const { authentication } = require('../middlewares/authentication')
const { upload } = require('../middlewares/upload')


const router = require('express').Router()

router.route('/').post(authentication,upload.array('auctionImages'),createAuction).get(authentication,getAllAuction)
router.route('/followingauction').get(authentication,getFollowingAuction)
router.route('/deleteauction').delete(authentication,deleteAuction)
router.route('/getauctioninfo').post(authentication,getOneAuction)
module.exports = router