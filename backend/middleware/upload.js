
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { id, tipo } = req.params;
    const dir = path.resolve(`uploads/imoveis/${id}/${tipo}`);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });
