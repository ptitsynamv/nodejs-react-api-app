const { validationResult } = require('express-validator');
const POST = require('../models/post');

exports.getPosts = (req, res, next) => {
  POST.fetchAll().then((posts) => {
    return res.status(200).json({ posts });
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
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
    });
};
