// backend/routes/routes.js
import express from 'express';
import userRoutes from './routes/userRoutes.js';  // Certifique-se de que o caminho está correto
import uploadRoutes from './routes/upload.routes.js';  // Certifique-se de que o caminho está correto
import requisicaoRoutes from './routes/requisicao.routes.js';
import imovelRoutes from './routes/imovel.routes.js';
import marketingRoutes from './routes/marketing.routes.js';









const router = express.Router();

router.get('/', (req, res) => {
  res.send('API funcionando!');
});

router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/requisicoes', requisicaoRoutes); 
router.use('/imoveis', imovelRoutes);
router.use('/marketing', marketingRoutes);


export default router;

