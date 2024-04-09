const { checkOut, getOrderId, webhook, getWalletBalance } = require('../controllers/topupController')
const { authentication } = require('../middlewares/authentication')
const router = require('express').Router()
const express = require('express')

router.route('/checkout').post(authentication,checkOut)
router.route('/getorder/:id').get(getOrderId)
router.route('/webhook').post(express.raw({type: 'application/json'}),webhook)
router.route('/walletbalance').get(authentication,getWalletBalance)

module.exports = router