import Placa from '../models/Placa.js';

// ✅ Criar ou somar placa existente
export const criarPlaca = async (req, res) => {
  try {
    const { titulo, largura, altura, material, tipo, quantidade, observacao } = req.body;

    if (!titulo || !largura || !altura || !material || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    // 🔍 Normaliza texto para evitar problemas com maiúsculas/minúsculas
    const tituloNorm = titulo.trim().toLowerCase();
    const materialNorm = material.trim().toLowerCase();
    const tipoNorm = tipo.trim().toLowerCase();
    const observacaoNorm = (observacao || '').trim().toLowerCase();

    // 🔎 Procura uma placa idêntica (em produção)
    const placaExistente = await Placa.findOne({
      titulo: { $regex: new RegExp(`^${tituloNorm}$`, 'i') },
      largura,
      altura,
      material: { $regex: new RegExp(`^${materialNorm}$`, 'i') },
      tipo: { $regex: new RegExp(`^${tipoNorm}$`, 'i') },
      observacao: { $regex: new RegExp(`^${observacaoNorm}$`, 'i') },
      status: 'produzir'
    });

    if (placaExistente) {
      // 🧮 Se já existe, apenas soma a quantidade
      placaExistente.quantidade += Number(quantidade) || 1;
      await placaExistente.save();
      return res.status(200).json({
        message: 'Quantidade somada à placa existente.',
        placa: placaExistente
      });
    }

    // 🆕 Caso contrário, cria uma nova
    const novaPlaca = new Placa({
      titulo,
      largura,
      altura,
      material,
      tipo,
      quantidade: Number(quantidade) || 1,
      observacao,
      status: 'produzir'
    });

    await novaPlaca.save();
    res.status(201).json({
      message: 'Nova placa criada com sucesso!',
      placa: novaPlaca
    });

  } catch (err) {
    console.error('Erro ao criar placa:', err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Listar todas as placas
export const listarPlacas = async (req, res) => {
  try {
    const placas = await Placa.find();
    res.json(placas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Enviar placa (para etapa "pagar")
export const enviarPlaca = async (req, res) => {
  try {
    const placa = await Placa.findById(req.params.id);
    if (!placa) return res.status(404).json({ error: 'Placa não encontrada' });

    const precoPorMetroQuadrado = 35;
    const larguraMetros = placa.largura / 100;
    const alturaMetros = placa.altura / 100;
    const metragem = larguraMetros * alturaMetros;
    const valorUnitario = metragem * precoPorMetroQuadrado;
    const valorTotal = valorUnitario * placa.quantidade;

    placa.status = 'pagar';
    placa.dataEnvio = new Date();
    placa.valor = valorTotal;

    await placa.save();
    res.json(placa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Atualizar status (ex: produzir → pagar → pago → usado)
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

// ✅ Listar por status (produzir / pagar / pago / usadas / etc.)
export const listarPlacasPorStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const placas = await Placa.find({ status });
    res.json(placas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Deletar placa
export const deletarPlaca = async (req, res) => {
  try {
    await Placa.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Placa deletada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const usarPlaca = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidadeUsada } = req.body;

    const placa = await Placa.findById(id);
    if (!placa) {
      return res.status(404).json({ error: 'Placa não encontrada' });
    }

    const qtdUsada = Number(quantidadeUsada) || 1;
    if (qtdUsada <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida.' });
    }

    if (placa.quantidade <= 0) {
      return res.status(400).json({ error: 'Nenhuma unidade disponível.' });
    }

    // Calcula a nova quantidade restante
    const novaQuantidade = placa.quantidade - qtdUsada;

    if (novaQuantidade > 0) {
      placa.quantidade = novaQuantidade;
      await placa.save();
      return res.status(200).json({
        message: `Usadas ${qtdUsada} unidade(s). Restam ${novaQuantidade}.`,
        placa,
      });
    } else {
      // Se não restarem unidades, muda o status
      placa.status = 'usado';
      placa.quantidade = 0;
      await placa.save();
      return res.status(200).json({
        message: `Todas as ${qtdUsada} unidades foram usadas. Placa marcada como usada.`,
        placa,
      });
    }
  } catch (err) {
    console.error('Erro ao usar placa:', err);
    res.status(500).json({ error: 'Erro ao usar placa: ' + err.message });
  }
};

