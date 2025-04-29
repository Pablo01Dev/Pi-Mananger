import Requisicao from '../models/RequisicaoImpressao.js';

export const criarRequisicao = async (req, res) => {
  try {
    const nova = await Requisicao.create(req.body);
    res.status(201).json(nova);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};

export const listarRequisicoes = async (req, res) => {
  try {
    const todas = await Requisicao.find();
    res.json(todas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

export const atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const requisicaoAtualizada = await Requisicao.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!requisicaoAtualizada) {
      return res.status(404).json({ erro: 'Requisição não encontrada.' });
    }

    res.json(requisicaoAtualizada);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};
