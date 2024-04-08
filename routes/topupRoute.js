const { checkOut, getOrderId, webhook } = require('../controllers/topupController')
const { authentication } = require('../middlewares/authentication')
const bodyParse = require('body-parser')
const router = require('express').Router()

router.route('/checkout').post(authentication,checkOut)
router.route('/getorder/:id').get(getOrderId)
router.route('/webhook').post(bodyParse.raw({ type: 'application/json' }),webhook)

module.exports = router