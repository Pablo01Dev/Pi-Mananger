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
    const placa = await Placa.findById(req.params.id);

    if (!placa) {
      return res.status(404).json({ error: 'Placa não encontrada' });
    }

    const precoPorMetroQuadrado = 35;

    // Cálculo da metragem
    const larguraMetros = placa.largura / 100;
    const alturaMetros = placa.altura / 100;
    const metragem = larguraMetros * alturaMetros;

    // Valor unitário
    const valorUnitario = metragem * precoPorMetroQuadrado;

    // Valor total = valor unitário * quantidade
    const valorTotal = valorUnitario * placa.quantidade;

    // Atualiza a placa com o valor calculado e status "pagar"
    placa.status = 'pagar';
    placa.dataEnvio = new Date();
    placa.valor = valorTotal;

    await placa.save();

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

