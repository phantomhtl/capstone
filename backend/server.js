// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize the app
const app = express();
// Connect to Database
connectDB();

// Middleware
app.use(cors());
// app.use(express.json());
// app.use(cors({
//   origin: 'http://localhost:3000' // Allow only this origin
// }));
app.use(bodyParser.json());


app.use('/uploads/images', express.static(path.join('uploads', 'images')));

const placesRoutes = require('./routes/placeRoutes');
const usersRoutes = require('./routes/userRoutes');
const HttpError = require('./models/httpError');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
