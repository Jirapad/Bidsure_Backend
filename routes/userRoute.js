const { getUserProfile, changePassword, updateUserImage, updateUserFullname, getAllUsername, updateUserBio, follow, unfollow, getFollowing, getUserForSocket } = require('../controllers/userController')
const { authentication } = require('../middlewares/authentication')
const { upload } = require('../middlewares/upload')

const router = require('express').Router()

router.route('/').get(authentication,getUserProfile)
router.route('/updateimage').patch(authentication,upload.single('userImage'),updateUserImage)
router.route('/updatefullname').patch(authentication,updateUserFullname)
router.route('/changepassword').patch(authentication,changePassword)
router.route('/alluseridandusername').get(authentication,getAllUsername)
router.route('/updatebio').patch(authentication,updateUserBio)
router.route('/follow').patch(authentication,follow).get(authentication,getFollowing)
router.route('/unfollow').patch(authentication,unfollow)
router.route('/getusersocket').get(authentication,getUserForSocket)

module.exports = router