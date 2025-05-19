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
    const placa = await Placa.findByIdAndUpdate(req.params.id, {
      status: 'pagar',
      dataEnvio: new Date()
    }, { new: true });
    res.json(placa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const atualizarStatus = async (req, res) => {
  try {
    const placa = await Placa.findByIdAndUpdate(req.params.id, {
      status: req.body.status
    }, { new: true });
    res.json(placa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
