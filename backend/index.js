// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes.js';

dotenv.config();

const app = express();

// ✅ CORS configurado para permitir acesso do Vercel e local
app.use(cors({
  origin: [
    'https://pi-mananger.vercel.app',  // domínio do front
    'http://localhost:5173'            // ambiente local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ✅ Rotas principais (mantém o prefixo /api)
app.use('/api', routes);

// ✅ Rota de teste (para confirmar se a API está viva)
app.get('/', (req, res) => {
  res.send('API Pi-Mananger funcionando! 🚀');
});

// ✅ Conexão MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));
