const fs = require("fs");
const path = require("path");

const DEFAULT_UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getUploadsRoot = () => {
  const root = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : DEFAULT_UPLOADS_DIR;

  ensureDir(root);
  return root;
};

const getUploadSubdir = (...parts) => {
  const dir = path.join(getUploadsRoot(), ...parts);
  ensureDir(dir);
  return dir;
};

module.exports = {
  getUploadsRoot,
  getUploadSubdir,
};
