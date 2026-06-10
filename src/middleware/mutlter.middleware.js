import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let dir;

    if (file.fieldname === "avatar") {
      dir = "./public/temp";
    } else if (file.fieldname === "pdf") {
      dir = "./uploads";
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);

    cb(
      null,
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar") {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    return cb(
      null,
      allowed.includes(file.mimetype)
    );
  }

  if (file.fieldname === "pdf") {
    return cb(
      null,
      file.mimetype === "application/pdf"
    );
  }

  cb(new Error("Invalid file type"));
};

export const upload = multer({
  storage,
  fileFilter,
});