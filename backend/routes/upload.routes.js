import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Imovel from '../models/Imovel.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const imovelId = req.params.id;
    const pastaDestino = path.join('uploads', imovelId, 'imagens');

    fs.mkdirSync(pastaDestino, { recursive: true });
    cb(null, pastaDestino);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage });

router.post('/:id', upload.single('arquivo'), async (req, res) => {
  try {
    const imovelId = req.params.id;
    const { path: filePath, filename } = req.file;

    // Atualiza o imóvel com a nova imagem
    await Imovel.findByIdAndUpdate(imovelId, {
      $push: {
        imagens: {
          path: filePath,
          filename
        }
      }
    });

    res.status(200).json({
      mensagem: 'Arquivo enviado e salvo no imóvel!',
      path: filePath
    });
  } catch (err) {
    console.error('Erro ao salvar imagem no imóvel:', err);
    res.status(500).json({ erro: 'Erro ao salvar imagem no imóvel' });
  }
  
});

export default router;
