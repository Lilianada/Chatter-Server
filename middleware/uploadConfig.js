const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads')); 
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


const fileFilter = (req, file, cb) => {
  if ((file.mimetype || file.type === 'image/jpeg') || (file.mimetype || file.type === 'image/png') || (file.type || file.mimetype === 'image/jpg')) {
    cb(null, true);
  } else {
    cb(null, false, new Error('Only .jpeg, .jpg and .png files are accepted'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = upload;
