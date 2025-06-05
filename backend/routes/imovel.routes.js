import express from 'express';
import multer from 'multer'; // Importe o Multer aqui!
import {
    criarImovel,
    listarImoveis,
    deletarImovel,
    atualizarStatus,
    atualizarVideo,
    atualizarImovel,
    atualizarOrdem,
    buscarUltimoImovel,
    uploadImagens, // Importe a nova função de upload de imagens
    deletarImagem   // Importe a nova função de deleção de imagem
} from '../controllers/imovelController.js';

const router = express.Router();

// Configuração do Multer para armazenamento em memória (buffer)
// Isso é crucial para que o arquivo seja processado e passado para o Dropbox
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas existentes
router.get('/ultimo', buscarUltimoImovel);
router.get('/', listarImoveis);
router.post('/', criarImovel);
router.patch('/:id/status', atualizarStatus);
router.put('/:id', atualizarImovel); // Patch é mais semântico para atualizações parciais, mas PUT também funciona
router.put('/ordem', atualizarOrdem);
router.delete('/:id', deletarImovel);

// --- Novas e Atualizadas Rotas de Upload de Arquivos ---

// Rota para atualizar/enviar um vídeo (requer 'arquivo' no FormData)
// Usa `upload.single()` porque esperamos apenas um arquivo de vídeo.
router.patch('/:id/video', upload.single('arquivo'), atualizarVideo);

// Rota para fazer upload de múltiplas imagens (requer 'arquivos' no FormData)
// Usa `upload.array()` porque esperamos múltiplos arquivos de imagem.
router.post('/:id/imagens', upload.array('arquivos'), uploadImagens);

// Rota para deletar uma imagem específica pelo seu filename
router.delete('/:id/imagens/:filename', deletarImagem);


export default router;