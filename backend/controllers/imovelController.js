import Imovel from '../models/Imovel.js';
import dropbox from '../config/dropboxClient.js';


import { Readable } from 'stream';

// Função para criar imóvel
// Função para criar imóvel
export const criarImovel = async (req, res) => {
  try {
    // ... código anterior

    const idImovel = String(novoImovel._id);

    // Criar o arquivo .keep na pasta raiz do imóvel para garantir que ela exista
    const caminhoRaiz = `/imoveis/${idImovel}/.keep`;
    await dropbox.filesUpload({
      path: caminhoRaiz,
      contents: Buffer.from(''),
      mode: { '.tag': 'overwrite' }
    });
    console.log(`[DEBUG] Pasta raiz criada no Dropbox: ${caminhoRaiz}`);

    // Criar subpastas com .keep
    const subpastas = ['videos', 'imagens', 'documentos'];
    for (const subpasta of subpastas) {
      const caminhoDropbox = `/imoveis/${idImovel}/${subpasta}/.keep`;
      const respostaDropbox = await dropbox.filesUpload({
        path: caminhoDropbox,
        contents: Buffer.from(''),
        mode: { '.tag': 'overwrite' }
      });
      console.log(`[DEBUG] Subpasta criada no Dropbox: ${caminhoDropbox}`, respostaDropbox);
    }

    // ... restante do código
  } catch (err) {
    // ... tratamento de erro
  }
};



// Atualizar status do imóvel
export const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['cadastrar', 'fazer video', 'fazer tour 360º', 'concluído'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido enviado.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(404).json({ erro: 'Imóvel não encontrado.' });

    imovel.status = status;
    await imovel.save();

    res.status(200).json({ sucesso: true, imovel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar o status do imóvel: ' + err.message });
  }
};

// Listar imóveis
export const listarImoveis = async (req, res) => {
  try {
    const imoveis = await Imovel.find().sort({ ordem: 1 });

    if (!imoveis || imoveis.length === 0) {
      return res.status(404).json({ erro: 'Nenhum imóvel encontrado.' });
    }

    res.status(200).json(imoveis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar imóveis: ' + err.message });
  }
};

// Atualizar vídeo usando Dropbox
export const atualizarVideo = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum vídeo enviado.' });
  }

  if (req.file.mimetype !== 'video/mp4') {
    return res.status(400).json({ erro: 'Tipo de arquivo não permitido. Apenas vídeos (MP4) são aceitos.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado.' });
    }

    const dropboxPath = `/imoveis/${id}/videos/${req.file.originalname}`;

    // Upload para o Dropbox
    await dropbox.filesUpload({
      path: dropboxPath,
      contents: req.file.buffer,
      mode: { '.tag': 'overwrite' }
    });

    // Gerar link compartilhável
    const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({ path: dropboxPath });

    // Atualizar imóvel com link do vídeo
    imovel.video = { ...imovel.video, link: sharedLink.url.replace('?dl=0', '?raw=1') };
    await imovel.save();

    res.status(200).json({ sucesso: true, link: imovel.video.link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar o vídeo do imóvel: ' + err.message });
  }
};

// Deletar imóvel e arquivos do Dropbox
export const deletarImovel = async (req, res) => {
  const { id } = req.params;

  try {
    const imovel = await Imovel.findById(id);

    if (!imovel) {
      return res.status(200).json({ success: true });
    }

    // Apaga o imóvel do banco primeiro
    await Imovel.findByIdAndDelete(id);

    const caminhoOriginal = `/imoveis/${id}`;
    const caminhoFinalizado = `/finalizados/${id}`;

    // Verifica se a pasta existe no Dropbox
    try {
      await dropbox.filesGetMetadata({ path: caminhoOriginal });
    } catch (err) {
      // Se não existir, já assume sucesso porque imóvel já foi deletado
      if (err?.error?.error_summary && err.error.error_summary.includes('path/not_found')) {
        console.warn('[WARN] Pasta de origem não encontrada no Dropbox, assumindo que já foi movida:', caminhoOriginal);
        return res.status(200).json({ success: true });
      }
      console.error('[ERRO] Pasta de origem não encontrada no Dropbox:', caminhoOriginal);
      return res.status(404).json({ success: false, error: 'Pasta de origem não encontrada no Dropbox' });
    }

    // Move os arquivos para /finalizados
    try {
      await dropbox.filesMoveV2({
        from_path: caminhoOriginal,
        to_path: caminhoFinalizado,
        autorename: true,
      });
    } catch (err) {
      console.error('[ERRO] Falha ao mover arquivos:', err);
      return res.status(500).json({ success: false, error: 'Erro ao mover arquivos no Dropbox' });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('[ERRO] Erro geral ao deletar imóvel:', err);
    res.status(500).json({
      success: false,
      error: 'Erro ao mover arquivos e remover imóvel'
    });
  }
};


// Atualizar dados do imóvel
export const atualizarImovel = async (req, res) => {
  const { id } = req.params;
  const dadosAtualizados = req.body;

  try {
    const imovel = await Imovel.findByIdAndUpdate(id, dadosAtualizados, { new: true });
    if (!imovel) return res.status(404).json({ mensagem: 'Imóvel não encontrado' });

    res.json(imovel);
  } catch (err) {
    console.error('Erro ao atualizar imóvel:', err);
    res.status(500).json({ mensagem: 'Erro ao atualizar imóvel' });
  }
};

// Atualizar ordem
export const atualizarOrdem = async (req, res) => {
  const { novaOrdem } = req.body;

  try {
    for (let i = 0; i < novaOrdem.length; i++) {
      const imovel = novaOrdem[i];
      await Imovel.findByIdAndUpdate(imovel._id, { ordem: i });
    }

    res.status(200).json({ message: 'Ordem atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar a ordem:', error);
    res.status(500).json({ message: 'Erro ao atualizar a ordem' });
  }
};

// Buscar último imóvel
export const buscarUltimoImovel = async (req, res) => {
  try {
    const ultimoImovel = await Imovel.findOne().sort({ ordem: -1 });
    if (!ultimoImovel) {
      return res.status(404).json({ message: 'Nenhum imóvel encontrado' });
    }
    res.json(ultimoImovel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar o último imóvel' });
  }
};
