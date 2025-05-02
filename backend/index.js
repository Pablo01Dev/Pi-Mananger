// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api', routes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado!');
    app.listen(process.env.PORT || 5000, () => {
      console.log('Servidor rodando na porta 5000');
    });
  })
  .catch(err => console.error('Erro ao conectar MongoDB:', err));