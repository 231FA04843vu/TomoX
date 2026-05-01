const { v2: cloudinary } = require("cloudinary");

const hasCloudinaryConfig = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

const ensureCloudinaryConfig = () => {
  if (!hasCloudinaryConfig()) return false;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
};

const uploadBufferToCloudinary = async ({ buffer, folder, publicId, resourceType = "image" }) => {
  if (!ensureCloudinaryConfig()) {
    throw new Error("Cloudinary is not configured");
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    upload.end(buffer);
  });
};

const uploadDataUriToCloudinary = async ({ dataUri, folder, publicId, resourceType = "image" }) => {
  if (!ensureCloudinaryConfig()) {
    throw new Error("Cloudinary is not configured");
  }

  return cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    resource_type: resourceType,
    overwrite: false,
  });
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId || !ensureCloudinaryConfig()) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  hasCloudinaryConfig,
  uploadBufferToCloudinary,
  uploadDataUriToCloudinary,
  deleteFromCloudinary,
};