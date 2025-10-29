import express from 'express';
import {
    criarPlaca,
    listarPlacas,
    enviarPlaca,
    atualizarStatus,
    listarPlacasPorStatus,
    deletarPlaca,
    usarPlaca
} from '../controllers/placaController.js';

const router = express.Router();

router.post('/', criarPlaca);
router.get('/', listarPlacas);
router.get('/status/:status', listarPlacasPorStatus);
router.put('/enviar/:id', enviarPlaca);
router.put('/status/:id', atualizarStatus);
router.delete('/:id', deletarPlaca);
router.put('/usar/:id', usarPlaca);


export default router;
