const { checkOut, getOrderId, webhook } = require('../controllers/topupController')
const { authentication } = require('../middlewares/authentication')
const router = require('express').Router()

router.route('/checkout').post(authentication,checkOut)
router.route('/getorder/:id').get(getOrderId)
router.route('/webhook').post(webhook)

module.exports = router