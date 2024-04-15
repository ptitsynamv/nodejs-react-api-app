const { validationResult } = require('express-validator');
const POST = require('../models/post');

exports.getPosts = (req, res, next) => {
  POST.fetchAll()
    .then((posts) => {
      return res.status(200).json({ posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;

  new POST({
    title,
    content,
    imageUrl: 'images/cat.jpg',
    creator: {
      name: 'my-name',
    },
  })
    .save()
    .then((post) => {
      return res.status(201).json({ post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;

  POST.fetchAll()
    .then((posts) => posts.find((post) => post.id === postId))
    .then((post) => {
      console.log({ post });
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
