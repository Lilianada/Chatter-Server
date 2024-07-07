const ErrorResponse = require("../utils/errorResponse");

exports.uploadImage = async (images, next) => {
  console.log("uploadImage was called");

  if (!images || images.length === 0) {
    return next(new ErrorResponse(`No image uploaded`, 400));
  }

  // Selecting the first image from the array
  const image = images[0] || images;
  console.log(image, images)
  if (!image.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  try {
    const filename = `${Math.floor(Math.random() * 100000 + 1)}.${image.name.replace(/\s/g, "")}`;
    const path = `${process.env.FILE_UPLOAD_PATH}/${filename}`;

    console.log("path", path);
    // 'mv' function to move the uploaded file to the desired location
    await new Promise((resolve, reject) => {
      image.mv(path, (err) => {
        if (err) {
          console.error(err);
          reject(new ErrorResponse(`Problem with file upload`, 500));
        }
        resolve();
      });
    });

    return { photoPath: `/uploads/${filename}` };
  } catch (error) {
    console.error("File move error:", error);
    return next(new ErrorResponse(`Problem with file upload`, 500));
  }
};
