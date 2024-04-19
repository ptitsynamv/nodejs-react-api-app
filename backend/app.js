const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { Server } = require('socket.io');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './images');
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const [filename, extension] = file.originalname.split('.');
    callback(null, filename + '-' + uniqueSuffix + '.' + extension);
  },
});
const fileFilter = (req, file, callback) => {
  callback(
    null,
    file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
  );
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
  console.log({ err });
  const { statusCode = 500, message, data } = err;
  res.status(statusCode).json({ message, data });
});

const server = app.listen(8080);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');
});
