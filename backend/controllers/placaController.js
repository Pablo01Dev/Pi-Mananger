import Placa from '../models/Placa.js';

// ✅ Criar ou somar placa existente
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

    // Só compara observação se ela existir
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


// ✅ Atualizar status
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
// ✅ Usar placa (com decremento de quantidade)
export const usarPlaca = async (req, res) => {
  console.log("🧩 ROTA /usar/:id ACESSADA");
  console.log("📦 Params:", req.params);
  console.log("📩 Body recebido:", req.body);

  try {
    const { id } = req.params;
    const { quantidadeUsada } = req.body;

    const placa = await Placa.findById(id);
    if (!placa) return res.status(404).json({ error: 'Placa não encontrada.' });

    const qtdUsada = Number(quantidadeUsada) || 1;
    if (qtdUsada <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida.' });
    }

    if (placa.quantidade < qtdUsada) {
      return res.status(400).json({ error: 'Quantidade insuficiente disponível.' });
    }

    const novaQuantidade = placa.quantidade - qtdUsada;

    if (novaQuantidade > 0) {
      placa.quantidade = novaQuantidade;
    } else {
      placa.status = 'usada';
      placa.quantidade = 0;
    }

    await placa.save();

    res.status(200).json({
      message: `Usadas ${qtdUsada} unidade(s). Restam ${placa.quantidade}.`,
      placa
    });
  } catch (err) {
    console.error('❌ Erro ao usar placa:', err);
    res.status(500).json({ error: 'Erro ao usar placa: ' + err.message });
  }
};


