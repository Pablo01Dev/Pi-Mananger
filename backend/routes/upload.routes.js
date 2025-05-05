import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Imovel from '../models/Imovel.js';

const router = express.Router(); // <- Esta linha corrige o erro


// Função assíncrona para criar diretórios de forma segura
const createDir = async (dir) => {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    throw new Error('Erro ao criar diretório');
  }
};

// Configuração do Multer
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const imovelId = req.params.id;
    const pastaDestino = path.join('uploads', imovelId, 'imagens');
    try {
      await createDir(pastaDestino);
      cb(null, pastaDestino);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

// Validação de tipo de arquivo (permitindo apenas imagens)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

// Função assíncrona para remover arquivo do disco
const unlinkAsync = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// POST: Enviar imagem
router.post('/:id', upload.single('arquivo'), async (req, res) => {
  try {
    const imovelId = req.params.id;
    const { path: filePath, filename } = req.file;

    await Imovel.findByIdAndUpdate(imovelId, {
      $push: {
        imagens: {
          path: filePath,
          filename
        }
      }
    });

    const imovelAtualizado = await Imovel.findById(imovelId);

    res.status(200).json({
      mensagem: 'Arquivo enviado e salvo no imóvel!',
      imagens: imovelAtualizado.imagens
    });
  } catch (err) {
    console.error('Erro ao salvar imagem no imóvel:', err);
    res.status(500).json({ erro: 'Erro ao salvar imagem no imóvel' });
  }
});

// DELETE: Remover imagem
router.delete('/:id/:filename', async (req, res) => {
  const { id, filename } = req.params;

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado' });

    const imagem = imovel.imagens.find(img => img.filename === filename);
    if (!imagem) return res.status(404).json({ erro: 'Imagem não encontrada' });

    await unlinkAsync(imagem.path); // Remover imagem de forma assíncrona

    await Imovel.findByIdAndUpdate(id, {
      $pull: { imagens: { filename } }
    });

    const imovelAtualizado = await Imovel.findById(id);

    res.json({
      mensagem: 'Imagem removida com sucesso!',
      imagens: imovelAtualizado.imagens
    });
  } catch (err) {
    console.error('Erro ao remover imagem:', err);
    res.status(500).json({ erro: 'Erro ao remover imagem' });
  }
});

export default router;
