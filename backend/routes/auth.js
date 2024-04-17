const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Enter valid email')
      .custom((value, { req }) => {
        return User.findByEmail(value).then(([user]) => {
          if (user) {
            return Promise.reject('Email already exists');
          }
        });
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 1 }),
    body('name').trim().not().isEmpty(),
  ],
  authController.signup
);

router.post('/login', authController.login);

module.exports = router;
