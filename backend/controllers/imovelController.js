import fs from 'fs-extra';
import path from 'path';
import Imovel from '../models/Imovel.js';
const ROOT_UPLOAD_DIR = path.resolve('uploads/imoveis');

// Função para criar imóvel
export const criarImovel = async (req, res) => {
  try {
    // Define ordem automaticamente (última ordem + 1)
    const ultimoImovel = await Imovel.findOne().sort('-ordem');
    const novaOrdem = ultimoImovel ? ultimoImovel.ordem + 1 : 1;

    // Cria o novo imóvel com ordem definida
    const novoImovel = await Imovel.create({
      ...req.body,
      ordem: novaOrdem,
    });

    // Cria pastas físicas
    const pastaImovel = path.join(ROOT_UPLOAD_DIR, String(novoImovel._id));
    const subpastas = ['videos', 'imagens', 'documentos'];

    for (const subpasta of subpastas) {
      await fs.ensureDir(path.join(pastaImovel, subpasta));
    }

    res.status(201).json(novoImovel);
  } catch (err) {
    console.error(err);
    res.status(400).json({ erro: 'Erro ao criar imóvel: ' + err.message });
  }
};


// Função para atualizar o status do imóvel
export const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`Atualizando status do imóvel ${id} para: ${status}`);  // Log do status recebido

  // Verificar se o status enviado é válido
  if (!['cadastrar', 'fazer video', 'fazer tour 360º', 'concluído'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido enviado.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado.' });
    }

    imovel.status = status;  // Atualiza o status conforme necessário
    await imovel.save();

    res.status(200).json({ sucesso: true, imovel });
  } catch (err) {
    console.error(err);  // Log detalhado de erro no servidor
    res.status(500).json({ erro: 'Erro ao atualizar o status do imóvel: ' + err.message });
  }
};

// Função para listar os imóveis
export const listarImoveis = async (req, res) => {
  try {
    // Ordena os imóveis pela propriedade 'ordem'
    const imoveis = await Imovel.find().sort({ ordem: 1 });  // 1 significa ordem crescente

    if (!imoveis || imoveis.length === 0) {
      return res.status(404).json({ erro: 'Nenhum imóvel encontrado.' });
    }

    res.status(200).json(imoveis);  // Retorna a lista de imóveis ordenados
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar imóveis: ' + err.message });
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

// Função para deletar um imóvel
export const deletarImovel = async (req, res) => {
  const { id } = req.params;

  try {
    const imovel = await Imovel.findByIdAndDelete(id);

    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado.' });
    }

    // Caminho onde os arquivos do imóvel estão armazenados
    const pastaImovel = path.join(ROOT_UPLOAD_DIR, String(id));

    // Verifica se a pasta existe e, se sim, exclui todos os arquivos dentro dela
    if (fs.existsSync(pastaImovel)) {
      await fs.remove(pastaImovel); // Remove a pasta e todos os arquivos dentro dela
    }

    res.status(200).json({ sucesso: 'Imóvel deletado com sucesso!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar imóvel: ' + err.message });
  }
};




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

// Atualiza a ordem dos imóveis
export const atualizarOrdem = async (req, res) => {
  const { novaOrdem } = req.body;  // A nova ordem dos imóveis

  try {
    // Atualiza cada imóvel com a nova ordem (supondo que cada imóvel tenha um campo 'ordem')
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

export const buscarUltimoImovel = async (req, res) => {
  try {
    // Encontra o imóvel com o maior valor de 'ordem'
    const ultimoImovel = await Imovel.findOne().sort({ ordem: -1 }); // Ordena de forma decrescente
    if (!ultimoImovel) {
      return res.status(404).json({ message: 'Nenhum imóvel encontrado' });
    }
    res.json(ultimoImovel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar o último imóvel' });
  }
};