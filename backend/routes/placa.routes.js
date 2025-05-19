import express from 'express';
import {
  criarPlaca,
  listarPlacas,
  enviarPlaca,
  atualizarStatus
} from '../controllers/placaController.js';

const router = express.Router();

router.post('/', criarPlaca);                // Criar nova placa
router.get('/', listarPlacas);               // Listar todas as placas
router.put('/enviar/:id', enviarPlaca);      // Mudar status para "pagar" + data de envio
router.put('/status/:id', atualizarStatus);  // Atualizar status para qualquer outro

export default router;
