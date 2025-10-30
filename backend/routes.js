import express from 'express';
import imovelRoutes from './routes/imovel.routes.js';
import placaRoutes from './routes/placa.routes.js';

const router = express.Router();

router.get('/', (req, res) => res.send('API funcionando!'));
router.use('/imoveis', imovelRoutes);
router.use('/placas', placaRoutes);

export default router;
