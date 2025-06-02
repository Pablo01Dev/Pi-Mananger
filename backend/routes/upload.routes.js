import express from 'express';
import { Dropbox } from 'dropbox';
import dotenv from 'dotenv';
import upload from '../middlewares/uploadMiddleware.js';

dotenv.config();

const router = express.Router();

const dropbox = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  fetch: fetch
});

router.post('/:id/upload', (req, res, next) => {
  upload.single('arquivo')(req, res, (err) => {
    if (err) {
      // Erro de multer
      return res.status(400).json({ erro: err.message });
    }
    next();
  });
}, async (req, res) => {
  const { id } = req.params;
  const arquivo = req.file;

  if (!arquivo) {
    return res.status(400).json({ erro: 'Arquivo não encontrado.' });
  }

  const dropboxPath = `/imoveis/${id}/videos/${arquivo.originalname}`;

  try {
    await dropbox.filesUpload({
      path: dropboxPath,
      contents: arquivo.buffer,
      mode: { '.tag': 'overwrite' }
    });

    res.status(200).json({ mensagem: 'Arquivo enviado com sucesso para o Dropbox!', caminho: dropboxPath });
  } catch (err) {
    console.error('Erro no upload para Dropbox:', err);
    res.status(500).json({ erro: 'Erro ao enviar o arquivo para o Dropbox.' });
  }
});

export default router;
