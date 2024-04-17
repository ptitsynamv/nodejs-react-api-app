const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { email, name, password } = req.body;
  bcryptjs
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({ email, name, password: hashedPassword });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: 'User created', userId: result.id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;

  User.findByEmail(email)
    .then(([user]) => {
      if (!user) {
        const error = new Error('There is no user with this email');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcryptjs.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Wrong password');
        error.statusCode = 401;
        throw error;
      }
      const token = jsonwebtoken.sign(
        { email: loadedUser.email, userId: loadedUser.id },
        'secret',
        { expiresIn: '1h' }
      );
      res.status(200).json({ token, userId: loadedUser.id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
