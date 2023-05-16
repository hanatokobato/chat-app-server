const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/api/v1/signup', authController.signup);
router.post('/api/v1/login', authController.login);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateUser
  )
  .delete(userController.deleteUser);

module.exports = router;
