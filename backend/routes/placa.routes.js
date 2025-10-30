import express from 'express';
import {
    criarPlaca,
    atualizarStatus,
    listarPlacasPorStatus,
    deletarPlaca,
    usarPlaca
} from '../controllers/placaController.js';

const router = express.Router();

router.post('/', criarPlaca);
router.get('/status/:status', listarPlacasPorStatus);
router.put('/status/:id', atualizarStatus);
router.delete('/:id', deletarPlaca);
router.put('/usar/:id', usarPlaca);


export default router;

 