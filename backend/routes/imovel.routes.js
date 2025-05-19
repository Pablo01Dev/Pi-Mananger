import express from 'express';
import {
  criarImovel,
  listarImoveis,
  deletarImovel,
  atualizarStatus,
  atualizarVideo,
  atualizarImovel,
  atualizarOrdem,
  buscarUltimoImovel 
} from '../controllers/imovelController.js';

const router = express.Router();

router.get('/', listarImoveis);
router.post('/', criarImovel);
router.patch('/:id/status', atualizarStatus);
router.patch('/:id/video', atualizarVideo);
router.delete('/:id', deletarImovel);
router.put('/:id', atualizarImovel);
router.put('/ordem', atualizarOrdem);

// Rota para buscar o último imóvel
router.get('/ultimo', buscarUltimoImovel);

export default router;
