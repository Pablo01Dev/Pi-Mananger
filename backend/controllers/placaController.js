import Placa from '../models/Placa.js';

// ✅ Criar ou somar placa existente
export const criarPlaca = async (req, res) => {
  try {
    const { titulo, largura, altura, material, tipo, quantidade, observacao } = req.body;

    if (!titulo || !largura || !altura || !material || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const tituloNorm = titulo.trim().toLowerCase();
    const materialNorm = material.trim().toLowerCase();
    const tipoNorm = tipo.trim().toLowerCase();
    const observacaoNorm = (observacao || '').trim().toLowerCase();

    // 🔍 Monta a query de busca de forma flexível
    const query = {
      titulo: { $regex: new RegExp(`^${tituloNorm}$`, 'i') },
      largura,
      altura,
      material: { $regex: new RegExp(`^${materialNorm}$`, 'i') },
      tipo: { $regex: new RegExp(`^${tipoNorm}$`, 'i') },
      status: 'produzir'
    };

    if (observacaoNorm) {
      query.observacao = { $regex: new RegExp(`^${observacaoNorm}$`, 'i') };
    }

    const placaExistente = await Placa.findOne(query);

    if (placaExistente) {
      placaExistente.quantidade += Number(quantidade) || 1;
      await placaExistente.save();
      return res.status(200).json({
        message: 'Quantidade somada à placa existente.',
        placa: placaExistente
      });
    }

    // 🆕 Cria nova placa
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
    console.error('❌ Erro ao criar placa:', err);
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
    const metragem = (placa.largura / 100) * (placa.altura / 100);
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

// ✅ Atualizar status
export const atualizarStatus = async (req, res) => {
  try {
    const validStatuses = ['produzir', 'pago', 'usada', 'pagar', 'outro'];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const placa = await Placa.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!placa) return res.status(404).json({ error: 'Placa não encontrada' });

    res.json(placa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Listar por status
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

// ✅ Usar placa (com decremento de quantidade)
export const usarPlaca = async (req, res) => {
  console.log("🧩 ROTA /usar/:id ACESSADA");
  console.log("📩 Body recebido:", req.body);

  try {
    const { id } = req.params;
    const qtdUsada = Number(req.body.quantidadeUsada) || 1;

    const placa = await Placa.findById(id);
    if (!placa) return res.status(404).json({ error: 'Placa não encontrada.' });

    if (qtdUsada <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida.' });
    }

    if (placa.quantidade < qtdUsada) {
      return res.status(400).json({ error: 'Quantidade insuficiente disponível.' });
    }

    // 🔹 Calcula nova quantidade para a placa original
    const novaQuantidade = placa.quantidade - qtdUsada;

    // 🔹 Atualiza a placa original
    placa.quantidade = novaQuantidade;
    await placa.save();

    // 🔹 Cria uma nova placa com status "usada"
    const placaUsada = new Placa({
      titulo: placa.titulo,
      largura: placa.largura,
      altura: placa.altura,
      material: placa.material,
      tipo: placa.tipo,
      observacao: placa.observacao,
      quantidade: qtdUsada,
      status: 'usada'
    });
    await placaUsada.save();

    console.log(`✅ ${qtdUsada} unidade(s) movida(s) para "usadas".`);

    res.status(200).json({
      message: `Foram movidas ${qtdUsada} unidade(s) para "usadas".`,
      placaAtualizada: placa,
      placaNova: placaUsada
    });

  } catch (err) {
    console.error('❌ Erro ao usar placa:', err);
    res.status(500).json({ error: 'Erro ao usar placa: ' + err.message });
  }
};
