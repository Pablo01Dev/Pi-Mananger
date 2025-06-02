import express from 'express';

import imovelRoutes from './routes/imovel.routes.js';
import placaRoutes from './routes/placa.routes.js';
import uploadRoutes from './routes/upload.routes.js';




const router = express.Router();

router.get('/', (req, res) => {
  res.send('API funcionando!');
});

router.use('/imoveis', imovelRoutes);
router.use('/placas', placaRoutes);
router.use('/upload', uploadRoutes);
router.use('/api', uploadRoutes); 


export default router;
