const Image = require('../models/image.model');
const sharp = require('sharp');
const httpStatus = require('http-status');
const config = require('../config/config');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const strings = require('../utils/strings');
const uploadService = require('./upload.service');

/**
 * Upload image
 * @param {Object} file
 * @returns {Promise<Image>}
 */
const uploadImage = async (file) => {
  const name = strings.generateFileName();
  const fileBuffer = await sharp(file.buffer).resize({ height: 256, width: 256 }).toBuffer();
  await uploadService.uploadFile({
    ...file,
    buffer: fileBuffer,
    key: name,
  });
  const url = `https://${config.aws.s3.bucketName}.s3.${config.aws.s3.bucketRegion}.amazonaws.com/${name}`;
  return Image.create({
    url,
    expires: true,
  });
};

/**
 * Remove image
 * @param {String} image
 * @returns {Promise<User>}
 */
const deleteImage = async (image) => {
  if (!image.includes('amazonaws.com')) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid image url');
  }
  const key = image.split('/').pop();
  await uploadService.deleteFile(key);
  await Image.deleteOne({ url: image });
  return null;
};

module.exports = {
  uploadImage,
  deleteImage,
};
