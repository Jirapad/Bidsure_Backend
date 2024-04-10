const { createTransection, getAllTransection } = require('../controllers/transectionController')
const { authentication } = require('../middlewares/authentication')
const router = require('express').Router()

router.route('/createtransection').post(authentication,createTransection)
router.route('/').get(authentication,getAllTransection)

module.exports = router