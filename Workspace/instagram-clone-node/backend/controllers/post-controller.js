const mongoose = require('mongoose');
const Post = require('../models/post');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    location: req.body.location,
    rawLocationLat: req.body.rawLocationLat,
    rawLocationLng: req.body.rawLocationLng,
    image: url + '/src/images/' + req.file.filename, // added by multer
  });
  // save to DB
  post
    .save()
    .then((createdPost) => {
      res.status(201).json({
        message: 'Post added successfully!',
        post: {
          ...createdPost,
          id: createdPost._id,
        },
      });
    })
    .catch((error) => {
      console.log('createPost', error);
      res.status(500).json({
        message: 'Creating a Post failed!',
      });
    });
};

exports.getPost = (req, res, next) => {
  // fetch all posts from DB
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json('Post Not Found !');
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Some problem while getting the Post!',
      });
    });
};

exports.getPosts = (req, res, next) => {
  let findQuery = Post.find();

  let fetchedPosts;
  // fetch all posts from DB
  findQuery
    .then((posts) => {
      fetchedPosts = posts.map((p) => {
        return {
          id: p._id,
          title: p.title,
          location: p.location,
          image: p.image,
          rawLocationLat: p.rawLocationLat,
          rawLocationLng: p.rawLocationLng,
        };
      });
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: 'Posts Fetched successfully',
        posts: fetchedPosts,
        totalPosts: count,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: 'Fetching the Posts failed!',
      });
    });
};
