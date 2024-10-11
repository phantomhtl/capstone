const multer = require('multer');
const { v1 } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, v1() + '.' + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  let error = isValid ? null : new Error('An Error Occurred');
  cb(error, isValid);
};

const fileUpload = multer({
  limits: 700000,
  storage: fileStorage,
  fileFilter: fileFilter
});

module.exports = fileUpload;
