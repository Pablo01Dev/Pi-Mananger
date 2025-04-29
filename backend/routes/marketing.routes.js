import express from 'express';
import {
  criarCard,
  listarCards,
  atualizarStatus
} from '../controllers/marketing.controller.js';

const router = express.Router();

router.post('/', criarCard);           // POST /api/imovel
router.get('/', listarCards);          // GET /api/imovel
router.put('/:id/status', atualizarStatus); // PUT /api/imovel/:id/status

export default router;
