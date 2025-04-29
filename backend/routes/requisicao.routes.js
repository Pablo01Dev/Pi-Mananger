import express from 'express';
import {
    criarRequisicao,
    listarRequisicoes,
    atualizarStatus
} from '../controllers/requisicao.controller.js';

const router = express.Router();

router.post('/', criarRequisicao);
router.get('/', listarRequisicoes);
router.put('/:id/status', atualizarStatus);

router.get('/', (req, res) => {
    console.log('Chegou na rota GET /requisicao');
    res.send('Usuários funcionando!');});

    export default router;
