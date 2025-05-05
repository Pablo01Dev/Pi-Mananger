import express from 'express';
import {
  criarImovel,
  listarImoveis,
  deletarImovel,
  atualizarStatus,
  atualizarVideo,
  atualizarImovel
} from '../controllers/imovelController.js';

const router = express.Router();

router.get('/', listarImoveis);
router.post('/', criarImovel);
router.patch('/:id/status', atualizarStatus);
router.patch('/:id/video', atualizarVideo);
router.delete('/:id', deletarImovel);
router.put('/:id', atualizarImovel);

export default router;
