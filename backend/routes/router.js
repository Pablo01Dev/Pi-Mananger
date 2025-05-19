import express from 'express';
import imovelRoutes from './imovel.routes.js';
import placaRoutes from './placa.routes.js';
import placaRoutes from './routes/placa.routes.js';


const router = express.Router();

router.use('/imoveis', imovelRoutes);
router.use('/placas', placaRoutes);
router.use('/placas', placaRoutes);

export default router;
