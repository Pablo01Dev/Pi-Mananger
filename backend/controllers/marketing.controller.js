import Marketing from '../models/Marketing.js';


export const criarCard = async (req, res) => {
  try {
    const novoCard = await Marketing.create(req.body);
    res.status(201).json(novoCard);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};


export const listarCards = async (req, res) => {
  try {
    const cards = await Marketing.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};


export const atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const cardAtualizado = await Marketing.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!cardAtualizado) {
      return res.status(404).json({ erro: 'Card não encontrado.' });
    }

    res.json(cardAtualizado);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
};
