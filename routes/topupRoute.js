const { checkOut, getOrderId, webhook } = require('../controllers/topupController')
const { authentication } = require('../middlewares/authentication')
const router = require('express').Router()

function rawBody(req, res, next) {
    req.setEncoding('utf8');
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        req.body = data;
        next();
    });
}

router.route('/checkout').post(authentication,checkOut)
router.route('/getorder/:id').get(getOrderId)
router.route('/webhook').post(rawBody,webhook)

module.exports = router