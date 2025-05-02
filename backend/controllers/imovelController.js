import fs from 'fs-extra';
import path from 'path';
import Imovel from '../models/Imovel.js';

const ROOT_UPLOAD_DIR = path.resolve('uploads/imoveis');

// Função para criar imóvel
export const criarImovel = async (req, res) => {
  try {
    const novoImovel = await Imovel.create(req.body);

    // Cria pastas físicas
    const pastaImovel = path.join(ROOT_UPLOAD_DIR, String(novoImovel._id));
    const subpastas = ['videos', 'imagens', 'documentos'];

    for (const subpasta of subpastas) {
      await fs.ensureDir(path.join(pastaImovel, subpasta));
    }

    res.status(201).json(novoImovel);
  } catch (err) {
    console.error(err);  // Log detalhado de erro no servidor
    res.status(400).json({ erro: 'Erro ao criar imóvel: ' + err.message });
  }
};


// Função para fazer upload de arquivos
export const uploadArquivo = async (req, res) => {
  const { id, tipo } = req.params;

  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
  }

  // Tipos de arquivo permitidos
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ erro: 'Tipo de arquivo não permitido. Apenas imagens (JPG, PNG) e vídeos (MP4) são aceitos.' });
  }

  const caminho = `/uploads/imoveis/${id}/${tipo}/${req.file.filename}`;

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado.' });
    }

    if (tipo === 'imagens') {
      imovel.imagens = [...(imovel.imagens || []), caminho];
    } else if (tipo === 'videos') {
      imovel.video = { ...imovel.video, link: caminho };
    } else {
      return res.status(400).json({ erro: 'Tipo de arquivo inválido. Use "imagens" ou "videos".' });
    }

    await imovel.save();

    res.status(200).json({ sucesso: true, caminho });
  } catch (err) {
    console.error(err);  // Log detalhado de erro no servidor
    res.status(500).json({ erro: 'Erro ao fazer upload do arquivo: ' + err.message });
  }
};
// Função para listar os imóveis
export const listarImoveis = async (req, res) => {
  try {
    const imoveis = await Imovel.find();  // Obtém todos os imóveis

    if (!imoveis || imoveis.length === 0) {
      return res.status(404).json({ erro: 'Nenhum imóvel encontrado.' });
    }

    res.status(200).json(imoveis);  // Retorna a lista de imóveis
  } catch (err) {
    console.error(err);  // Log detalhado de erro no servidor
    res.status(500).json({ erro: 'Erro ao listar imóveis: ' + err.message });
  }
};

// Função para atualizar o status do imóvel
export const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado.' });
    }

    imovel.status = status;  // Atualize o status conforme necessário
    await imovel.save();

    res.status(200).json({ sucesso: true, imovel });
  } catch (err) {
    console.error(err);  // Log detalhado de erro no servidor
    res.status(500).json({ erro: 'Erro ao atualizar o status do imóvel: ' + err.message });
  }
};

// Função para atualizar o vídeo do imóvel
export const atualizarVideo = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum vídeo enviado.' });
  }

  // Verificando se o arquivo enviado é um vídeo
  if (req.file.mimetype !== 'video/mp4') {
    return res.status(400).json({ erro: 'Tipo de arquivo não permitido. Apenas vídeos (MP4) são aceitos.' });
  }

  const caminho = `/uploads/imoveis/${id}/videos/${req.file.filename}`;

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado.' });
    }

    // Atualizando o vídeo do imóvel
    imovel.video = { ...imovel.video, link: caminho };

    await imovel.save();

    res.status(200).json({ sucesso: true, caminho });
  } catch (err) {
    console.error(err);  // Log detalhado de erro no servidor
    res.status(500).json({ erro: 'Erro ao atualizar o vídeo do imóvel: ' + err.message });
  }
};


