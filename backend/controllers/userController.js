// backend/controllers/userController.js
import User from '../models/User.js';

export const criarUsuario = async (req, res) => {
  try {
    const novoUsuario = new User(req.body);
    const salvo = await novoUsuario.save();
    res.status(201).json(salvo);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

export const deletarUsuario = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
