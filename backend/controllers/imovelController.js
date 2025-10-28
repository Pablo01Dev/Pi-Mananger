// controllers/imovelController.js
import Imovel from '../models/Imovel.js';
import dropbox from '../config/dropboxClient.js';
import mongoose from 'mongoose';

// ==================================================
// 🔧 Função auxiliar para upload em sessão (arquivos grandes)
// ==================================================
async function uploadEmSessao(path, buffer) {
  const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB
  const total = buffer.length;

  if (total <= CHUNK_SIZE) {
    await dropbox.filesUpload({
      path,
      contents: buffer,
      mode: { '.tag': 'overwrite' },
      autorename: true,
    });
  } else {
    const start = await dropbox.filesUploadSessionStart({
      close: false,
      contents: buffer.slice(0, CHUNK_SIZE),
    });
    const sessionId = start.result.session_id;

    let offset = CHUNK_SIZE;
    while (offset < total - CHUNK_SIZE) {
      await dropbox.filesUploadSessionAppendV2({
        cursor: { session_id: sessionId, offset },
        close: false,
        contents: buffer.slice(offset, offset + CHUNK_SIZE),
      });
      offset += CHUNK_SIZE;
    }

    await dropbox.filesUploadSessionFinish({
      cursor: { session_id: sessionId, offset },
      commit: { path, mode: { '.tag': 'overwrite' }, autorename: true },
      contents: buffer.slice(offset, total),
    });
  }
}

// ==================================================
// 📤 Função auxiliar para obter ou criar link compartilhado
// ==================================================
async function getOrCreateSharedLink(path) {
  try {
    const links = await dropbox.sharingListSharedLinks({ path, direct_only: true });
    if (links.result.links.length > 0) {
      return links.result.links[0].url.replace('?dl=0', '?raw=1');
    }
  } catch (err) {
    console.warn(`[AVISO] Falha ao listar link Dropbox (${path}):`, err.message);
  }

  try {
    const newLink = await dropbox.sharingCreateSharedLinkWithSettings({ path });
    return newLink.result.url.replace('?dl=0', '?raw=1');
  } catch (err) {
    console.error(`[ERRO] Falha ao criar link compartilhado (${path}):`, err.message);
    return null;
  }
}

// ==================================================
// 🏠 Criar imóvel (sem necessidade de upload)
// ==================================================
export const criarImovel = async (req, res) => {
  try {
    const { titulo, descricao, status } = req.body;

    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O campo título é obrigatório.' });
    }

    const novoImovel = new Imovel({
      titulo,
      descricao: descricao || '',
      status: status || 'cadastrar',
      imagens: [],
      video: null,
    });

    await novoImovel.save();

    // Criação opcional das pastas no Dropbox
    try {
      const idImovel = String(novoImovel._id);
      const basePath = `/imoveis/${idImovel}`;
      const paths = [
        `${basePath}/.keep`,
        `${basePath}/videos/.keep`,
        `${basePath}/imagens/.keep`,
        `${basePath}/documentos/.keep`,
      ];

      for (const caminho of paths) {
        try {
          await dropbox.filesUpload({
            path: caminho,
            contents: Buffer.from(''),
            mode: { '.tag': 'overwrite' },
          });
        } catch (e) {
          console.warn(`[Dropbox] Falha ao criar: ${caminho}`, e.message);
        }
      }
    } catch (e) {
      console.warn('[Dropbox] Erro secundário ao criar pastas:', e.message);
    }

    res.status(201).json({ sucesso: true, imovel: novoImovel });
  } catch (err) {
    console.error('[ERRO] Erro ao criar imóvel:', err);
    res.status(500).json({ erro: 'Erro ao criar imóvel: ' + err.message });
  }
};

// ==================================================
// 🔄 Atualizar status do imóvel
// ==================================================
export const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const statusValidos = ['cadastrar', 'fazer video', 'fazer tour 360º', 'concluído', 'disponivel'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado.' });

    imovel.status = status;
    await imovel.save();

    res.status(200).json({ sucesso: true, imovel });
  } catch (err) {
    console.error('[ERRO] Erro ao atualizar status:', err);
    res.status(500).json({ erro: 'Erro ao atualizar status: ' + err.message });
  }
};

// ==================================================
// 📋 Listar imóveis
// ==================================================
export const listarImoveis = async (req, res) => {
  try {
    const imoveis = await Imovel.find({});

    if (!imoveis.length) {
      return res.status(404).json({ erro: 'Nenhum imóvel encontrado.' });
    }

    res.status(200).json(imoveis);
  } catch (err) {
    console.error('[ERRO] Erro ao listar imóveis:', err);
    res.status(500).json({ erro: 'Erro ao listar imóveis: ' + err.message });
  }
};

// ==================================================
// 🎬 Atualizar vídeo
// ==================================================
export const atualizarVideo = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum vídeo enviado.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado.' });

    const path = `/imoveis/${id}/videos/${req.file.originalname}`;
    await uploadEmSessao(path, req.file.buffer);
    const link = await getOrCreateSharedLink(path);

    imovel.video = { nome: req.file.originalname, link };
    await imovel.save();

    res.status(200).json({ sucesso: true, video: imovel.video });
  } catch (err) {
    console.error('[ERRO] Erro ao atualizar vídeo:', err);
    res.status(500).json({ erro: 'Erro ao atualizar vídeo: ' + err.message });
  }
};

// ==================================================
// 🖼 Upload múltiplo de imagens
// ==================================================
export const uploadImagens = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  if (!req.files?.length) {
    return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado.' });

    const imagens = [];

    for (const file of req.files) {
      const path = `/imoveis/${id}/imagens/${file.originalname}`;
      await uploadEmSessao(path, file.buffer);
      const link = await getOrCreateSharedLink(path);

      const nova = { nome: file.originalname, filename: file.originalname, link };
      const idx = imovel.imagens.findIndex(img => img.filename === nova.filename);

      if (idx > -1) imovel.imagens[idx] = nova;
      else imovel.imagens.push(nova);

      imagens.push(nova);
    }

    await imovel.save();
    res.status(200).json({ sucesso: true, imagens });
  } catch (err) {
    console.error('[ERRO] Erro ao fazer upload de imagens:', err);
    res.status(500).json({ erro: 'Erro ao fazer upload: ' + err.message });
  }
};

// ==================================================
// ❌ Deletar imagem
// ==================================================
export const deletarImagem = async (req, res) => {
  const { id, filename } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado.' });

    const dropboxPath = `/imoveis/${id}/imagens/${filename}`;
    try {
      await dropbox.filesDeleteV2({ path: dropboxPath });
    } catch (e) {
      if (!e?.error?.error_summary?.includes('path/not_found')) {
        console.error(`[ERRO] Falha ao deletar arquivo no Dropbox:`, e);
      }
    }

    imovel.imagens = imovel.imagens.filter(img => img.filename !== filename);
    await imovel.save();

    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error('[ERRO] Erro ao deletar imagem:', err);
    res.status(500).json({ erro: 'Erro ao excluir imagem: ' + err.message });
  }
};

// ==================================================
// 🗑 Deletar imóvel (mover para /finalizados no Dropbox)
// ==================================================
export const deletarImovel = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(200).json({ sucesso: true, mensagem: 'Imóvel já removido.' });

    imovel.status = 'concluído';
    await imovel.save();
    await Imovel.findByIdAndDelete(id);

    const origem = `/imoveis/${id}`;
    const destino = `/finalizados/${id}`;

    try {
      await dropbox.filesMoveV2({ from_path: origem, to_path: destino, autorename: true });
    } catch (e) {
      console.warn(`[Dropbox] Falha ao mover pasta:`, e.message);
    }

    res.status(200).json({ sucesso: true, mensagem: 'Imóvel removido com sucesso.' });
  } catch (err) {
    console.error('[ERRO] Erro ao deletar imóvel:', err);
    res.status(500).json({ erro: 'Erro ao excluir imóvel: ' + err.message });
  }
};

// ==================================================
// ↕ Atualizar ordem
// ==================================================
export const atualizarOrdem = async (req, res) => {
  const { novaOrdem } = req.body;
  if (!Array.isArray(novaOrdem) || !novaOrdem.length) {
    return res.status(400).json({ message: 'Array novaOrdem inválido.' });
  }

  try {
    const ops = novaOrdem.map((item, i) =>
      mongoose.Types.ObjectId.isValid(item._id)
        ? Imovel.findByIdAndUpdate(item._id, { ordem: i })
        : null
    ).filter(Boolean);

    await Promise.all(ops);
    res.status(200).json({ message: 'Ordem atualizada com sucesso!' });
  } catch (err) {
    console.error('[ERRO] Erro ao atualizar ordem:', err);
    res.status(500).json({ message: 'Erro ao atualizar ordem' });
  }
};

// ==================================================
// 🔎 Buscar último imóvel
// ==================================================
export const buscarUltimoImovel = async (req, res) => {
  try {
    const ultimo = await Imovel.findOne().sort({ ordem: -1 });
    if (!ultimo) return res.status(404).json({ message: 'Nenhum imóvel encontrado.' });
    res.json(ultimo);
  } catch (err) {
    console.error('[ERRO] Erro ao buscar último imóvel:', err);
    res.status(500).json({ message: 'Erro ao buscar último imóvel' });
  }
};
