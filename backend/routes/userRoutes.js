import express from 'express';
import { criarUsuario, listarUsuarios, deletarUsuario } from '../controllers/userController.js';

const router = express.Router();

// Definindo as rotas
router.get('/', listarUsuarios);  // Rota para listar todos os usuários
router.post('/', criarUsuario);  // Rota para criar um novo usuário
router.delete('/:id', deletarUsuario);  // Rota para deletar um usuário

router.get('/', (req, res) => {
  console.log('Chegou na rota GET /users');
  res.send('Usuários funcionando!');
});

export default router;
