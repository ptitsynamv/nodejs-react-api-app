const { validationResult } = require('express-validator');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: 'id_1',
        title: 'First Post',
        content: 'This is the first post!',
        imageUrl: 'images/cat.jpg',
        creator: {
          name: 'my-name',
        },
        createdAt: new Date(),
      },
    ],
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

  // Create post in db
  res.status(201).json({
    message: 'Post created successfully!',
    post: {
      id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: 'my-name',
      },
      createdAt: new Date(),
    },
  });
};
