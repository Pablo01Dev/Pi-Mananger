import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Imovel from '../models/Imovel.js';

const router = express.Router();

// Função para criar diretórios
const createDir = async (dir) => {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    throw new Error('Erro ao criar diretório');
  }
};

// ===== CONFIGURAÇÃO PARA IMAGENS =====
const imageStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const imovelId = req.params.id;
    const pastaDestino = path.join('uploads', imovelId, 'imagens');
    try {
      await createDir(pastaDestino);
      cb(null, pastaDestino);
    } catch (err) {
      cb(new Error('Falha ao criar diretório de upload.'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de imagem não permitido'), false);
  }
  cb(null, true);
};

const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter });

// ===== CONFIGURAÇÃO PARA VÍDEOS =====
const videoStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const imovelId = req.params.id;
    const pastaDestino = path.join('uploads', imovelId, 'videos');
    try {
      await createDir(pastaDestino);
      cb(null, pastaDestino);
    } catch (err) {
      cb(new Error('Falha ao criar diretório de upload de vídeo.'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de vídeo não permitido'), false);
  }
  cb(null, true);
};

const uploadVideo = multer({ storage: videoStorage, fileFilter: videoFilter });

// ===== FUNÇÃO PARA DELETAR ARQUIVOS =====
const unlinkAsync = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// ===== ROTA: Enviar imagem =====
router.post('/:id/imagens', uploadImage.single('arquivo'), async (req, res) => {
  try {
    const imovelId = req.params.id;
    const { path: filePath, filename } = req.file;

    await Imovel.findByIdAndUpdate(imovelId, {
      $push: {
        imagens: {
          path: path.join('uploads', imovelId, 'imagens', filename),
          filename
        }
      }
    });

    const imovelAtualizado = await Imovel.findById(imovelId);

    res.status(200).json({
      mensagem: 'Imagem enviada com sucesso!',
      imagens: imovelAtualizado.imagens
    });
  } catch (err) {
    console.error('Erro ao salvar imagem:', err);
    res.status(500).json({ erro: 'Erro ao salvar imagem' });
  }
});


// ===== ROTA: Enviar vídeo =====

router.post('/:id/video', uploadVideo.single('arquivo'), async (req, res) => {
  try {
    const imovelId = req.params.id;
    const { path: filePath, filename } = req.file;

    // Atualiza o campo "video" substituindo o valor anterior
    await Imovel.findByIdAndUpdate(imovelId, {
      video: {
        path: path.join('uploads', imovelId, 'videos', filename),
        filename
      }
    });

    const imovelAtualizado = await Imovel.findById(imovelId);

    res.status(200).json({
      mensagem: 'Vídeo enviado com sucesso!',
      video: imovelAtualizado.video
    });
  } catch (err) {
    console.error('Erro ao salvar vídeo:', err);
    res.status(500).json({ erro: 'Erro ao salvar vídeo' });
  }
});


// ===== ROTA: Remover imagem =====
router.delete('/:id/:filename', async (req, res) => {
  const { id, filename } = req.params;

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado' });

    const imagem = imovel.imagens.find(img => img.filename === filename);
    if (!imagem) return res.status(404).json({ erro: 'Imagem não encontrada' });

    await unlinkAsync(imagem.path);

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
