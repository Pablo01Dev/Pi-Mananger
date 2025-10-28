import express from 'express';
import multer from 'multer';
import {
  criarImovel,
  listarImoveis,
  deletarImovel,
  atualizarStatus,
  atualizarVideo,
  atualizarImovel,
  atualizarOrdem,
  buscarUltimoImovel,
  uploadImagens,
  deletarImagem
} from '../controllers/imovelController.js';

const router = express.Router();

// ---------------------------------------------
// ⚙️ Configuração do Multer — armazenamento em memória
// ---------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------------------------------
// 🏠 Rotas principais
// ---------------------------------------------

// Criar novo imóvel
router.post('/', criarImovel);

// Listar todos os imóveis
router.get('/', listarImoveis);

// Buscar o último imóvel criado
router.get('/ultimo', buscarUltimoImovel);

// Atualizar informações gerais do imóvel
router.put('/:id', atualizarImovel);

// Atualizar status (ex: “fazer vídeo”, “concluído”)
router.put('/:id/status', atualizarStatus);

// Atualizar ordem dos imóveis (drag and drop)
router.put('/ordem', atualizarOrdem);

// Excluir imóvel (move pasta para /finalizados no Dropbox)
router.delete('/:id', deletarImovel);

// ---------------------------------------------
// 📦 Uploads de mídia (imagens e vídeos)
// ---------------------------------------------

// Upload de múltiplas imagens (form-data: imagens[])
router.post('/:id/imagens', upload.array('imagens'), uploadImagens);

// Upload de vídeo único (form-data: video)
router.post('/:id/video', upload.single('video'), atualizarVideo);

// Excluir imagem específica de um imóvel
router.delete('/:id/imagens/:filename', deletarImagem);

export default router;
