import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { id, tipo } = req.params;
    const dir = path.resolve(`uploads/imoveis/${id}/${tipo}`);

    // Criar diretório se não existir
    fs.promises.mkdir(dir, { recursive: true }).then(() => {
      cb(null, dir);
    }).catch((err) => {
      cb(new Error('Erro ao criar diretório de upload.'));
    });
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });
