const { checkOut, getOrderId, webhook, captureRawBody } = require('../controllers/topupController')
const { authentication } = require('../middlewares/authentication')
const express = require('express')
const router = require('express').Router()

router.route('/checkout').post(authentication,checkOut)
router.route('/getorder/:id').get(getOrderId)
router.route('/webhook').post(captureRawBody,webhook)
//router.route('/webhook', express.raw({type: 'application/json'})).post(webhook)
//router.post('/webhook', express.raw({type:'application/json'}), webhook);

module.exports = router