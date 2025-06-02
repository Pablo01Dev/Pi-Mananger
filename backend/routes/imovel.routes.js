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

router.get('/ultimo', buscarUltimoImovel);
router.get('/', listarImoveis);
router.post('/', criarImovel);
router.patch('/:id/status', atualizarStatus);
router.patch('/:id/video', atualizarVideo);
router.put('/:id', atualizarImovel);
router.put('/ordem', atualizarOrdem);
router.delete('/:id', deletarImovel);

export default router;

