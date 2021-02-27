const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postRoutes = require('./routes/post-routes');

const app = express();

// connect to the database
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('Connected !');
  })
  .catch(() => {
    console.log('Connection Failed.');
  });

// parser body
app.use(bodyParser.json()); // for json body
app.use(bodyParser.urlencoded()); // for url encoded body (html form)

// static files
//app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/', express.static(path.join(__dirname, '../public')));

app.use('/api/posts', postRoutes);
/*
app.use('/api/posts', (req, res, next) => {
  console.log('posts');
  res.status(200).json([
    {
      id: '60365cdcd73cc72c80003abc',
      title: 'White Turf zzz',
      location: 'St. Moritz zzz',
      image: 'http://localhost:3000/src/images/white-turf-st-moritz.jpg',
    },
  ]);
});
*/

// routes
// pages
// app.use('/help', (req, res, next) => {
//   console.log('help');
//   res.sendFile(path.join(__dirname, '../public/help', 'index.html'));
// });
// app.use('/', (req, res, next) => {
//   console.log('home');
//   res.sendFile(path.join(__dirname, '../public', 'index.html'));
// });

module.exports = app;