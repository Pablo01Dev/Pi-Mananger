import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { id } = req.params;
    const tipo = req.query.tipo || 'geral'; // tipo = imagens, videos, documentos...

    const baseDir = path.resolve(`uploads/${id}/${tipo}`);

    fs.mkdirSync(baseDir, { recursive: true });

    cb(null, baseDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nome = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, nome);
  }
});

const upload = multer({ storage });

export default upload;
