const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');

const ITEMS_PER_PAGE = 10;

function getItemsForPage(items, page) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const limit = ITEMS_PER_PAGE;
  return items.slice(skip, skip + limit);
}

exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1;

  Post.fetchAll()
    .then((posts) => {
      return res.status(200).json({
        posts: getItemsForPage(posts, page),
        totalItems: posts.length,
      });
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
  if (!req.file) {
    const error = new Error('No image');
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;
  const { path: imageUrl } = req.file;
  let creator;
  let newPost;

  new Post({
    title,
    content,
    imageUrl,
    creator: req.userId,
  })
    .save()
    .then((post) => {
      newPost = post;
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;

      const updatedUser = new User({
        ...user,
        posts: [...user.posts, newPost.id],
      });
      return updatedUser.update();
    })
    .then((result) => {
      return res.status(201).json({
        post: newPost,
        creator: { id: creator.id, name: creator.name },
      });
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

  Post.findById(postId)
    .then((post) => {
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

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error('No file');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator !== req.userId) {
        const error = new Error('Not authenticated');
        error.statusCode = 403;
        throw error;
      }

      const updatedPost = new Post({ ...post, title, content, imageUrl });

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      return updatedPost.update();
    })
    .then((post) => {
      res.status(200).json({ message: 'Post updated', post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;

  let currentPost;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator !== req.userId) {
        const error = new Error('Not authenticated');
        error.statusCode = 403;
        throw error;
      }

      currentPost = post;
      // Check user
      clearImage(post.imageUrl);
      return Post.delete(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      return new User({
        ...user,
        posts: user.posts.filter((p) => p !== currentPost.id),
      }).update();
    })
    .then(() => {
      res.status(200).json({ message: 'Post was deleted' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  const imagePath = path.join(__dirname, '..', filePath);
  fs.unlink(imagePath, (err) => {
    console.log({ err });
  });
};
