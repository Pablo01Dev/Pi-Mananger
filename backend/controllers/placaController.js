import Placa from '../models/Placa.js';

export const criarPlaca = async (req, res) => {
  try {
    const placa = new Placa(req.body);
    await placa.save();
    res.status(201).json(placa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listarPlacas = async (req, res) => {
  try {
    const placas = await Placa.find();
    res.json(placas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const enviarPlaca = async (req, res) => {
  try {
    const { valor } = req.body;  // pegar o valor calculado enviado pelo frontend

    if (valor === undefined) {
      return res.status(400).json({ error: 'Valor é obrigatório' });
    }

    const placa = await Placa.findByIdAndUpdate(
      req.params.id,
      {
        status: 'pagar',
        dataEnvio: new Date(),
        valor: valor  // salva o valor recebido
      },
      { new: true }
    );

    if (!placa) {
      return res.status(404).json({ error: 'Placa não encontrada' });
    }

    res.json(placa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const atualizarStatus = async (req, res) => {
  try {
    const validStatuses = ['produzir', 'pago', 'usado', 'pagar', 'outro'];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const placa = await Placa.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!placa) {
      return res.status(404).json({ error: 'Placa não encontrada' });
    }

    res.json(placa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const listarPlacasPorStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const placas = await Placa.find({ status });
    res.json(placas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletarPlaca = async (req, res) => {
  try {
    await Placa.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Placa deletada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

