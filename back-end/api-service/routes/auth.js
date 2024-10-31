const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.post('/login', authController.login);
router.post('/signup', authController.signUp);
// router.post('/confirm-signup', authController.confirmSignUp);
router.post('/setup-mfa', authController.setupMFA);
router.post('/verify-mfa', authController.verifyMFA);
router.post('/verify-mfa-setup', authController.verifyMFASetup);





// Admin-only routes
router.get('/admin/users', authController.getAllUsers);
router.post('/admin/verify', authController.verifyUser);
router.post('/admin/delete', authController.deleteUser);
router.post('/admin/make-admin', authController.makeAdmin);
router.post('/admin/demote-admin', authController.demoteAdmin);



module.exports = router;
