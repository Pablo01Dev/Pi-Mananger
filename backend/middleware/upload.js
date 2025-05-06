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

// Verificação do tipo de arquivo
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'video/mp4']; // Exemplo para imagens e vídeos
    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido.'), false);
    }
    cb(null, true);
  }
});

