// routes/imovel.routes.js
import express from 'express';
import {
  criarImovel,
  listarImoveis,
  atualizarStatus,
  atualizarVideo
} from '../controllers/imovelController.js';

const router = express.Router();

router.get('/', listarImoveis);
router.post('/', criarImovel);
router.patch('/:id/status', atualizarStatus);
router.patch('/:id/video', atualizarVideo);

export default router;
