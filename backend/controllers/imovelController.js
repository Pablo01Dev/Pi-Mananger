import Imovel from '../models/Imovel.js';
import dropbox from '../config/dropboxClient.js';
import mongoose from 'mongoose'; // Importe o Mongoose para validação de ObjectId

// ---
// Função auxiliar para upload em sessão, para lidar com arquivos grandes
async function uploadEmSessao(path, buffer) {
  const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB por chunk
  const tamanhoTotal = buffer.length;

  if (tamanhoTotal <= CHUNK_SIZE) {
    // Para arquivos menores que o chunk, upload direto
    await dropbox.filesUpload({
      path,
      contents: buffer,
      mode: { '.tag': 'overwrite' },
      autorename: true, // Adicionado para consistência com o upload em sessão
    });
  } else {
    // Para arquivos maiores, upload em sessão (chunked)
    const session = await dropbox.filesUploadSessionStart({
      close: false,
      contents: buffer.slice(0, CHUNK_SIZE),
    });
    const sessionId = session.result.session_id;

    let offset = CHUNK_SIZE;
    while (offset < tamanhoTotal - CHUNK_SIZE) {
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
      contents: buffer.slice(offset, tamanhoTotal),
    });
  }
}

// ---
// Função auxiliar para obter ou criar um link compartilhado do Dropbox
async function getOrCreateSharedLink(path) {
  try {
    const listLinks = await dropbox.sharingListSharedLinks({ path, direct_only: true });
    if (listLinks.result.links.length > 0) {
      const existingLink = listLinks.result.links[0].url;
      const finalLink = existingLink.replace('?dl=0', '?raw=1');
      return finalLink;
    }
  } catch (error) {
    // **AJUSTE NO LOGGING:** Mensagem de erro mais clara para o primeiro try/catch
    console.warn(`[AVISO] getOrCreateSharedLink: Não foi possível listar links compartilhados para '${path}'. Tentando criar um novo. Erro: ${error.message}`);
    if (error?.error?.error_summary?.includes('path/not_found')) {
      console.error(`[ERRO DETALHE] getOrCreateSharedLink - listLinks falhou para o caminho: '${path}' com erro: ${error.error_summary}`);
    }
  }

  try {
    const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({ path: path });
    const finalLink = sharedLink.result.url.replace('?dl=0', '?raw=1');
    return finalLink;
  } catch (createError) {
    // **AJUSTE NO LOGGING:** Mensagem de erro mais clara para o segundo try/catch
    console.error(`[ERRO CRÍTICO] getOrCreateSharedLink - Falha ao criar novo link compartilhado para '${path}':`, createError);
    if (createError?.error?.error_summary?.includes('path/not_found')) {
      console.error(`[ERRO DETALHE] getOrCreateSharedLink - createSharedLink falhou para o caminho: '${path}' com erro: ${createError.error_summary}`);
    }
    return null; // Retorna null em caso de falha
  }
}


// Criar um novo imóvel
export const criarImovel = async (req, res) => {
  try {
    const novoImovel = new Imovel(req.body);
    await novoImovel.save();

    const idImovel = String(novoImovel._id);
    const basePath = `/imoveis/${idImovel}`;

    // Cria a pasta raiz do imóvel e subpastas com arquivos .keep para garantir a existência
    const pathsToCreate = [
      `${basePath}/.keep`,
      `${basePath}/videos/.keep`,
      `${basePath}/imagens/.keep`,
      `${basePath}/documentos/.keep`
    ];

    for (const caminho of pathsToCreate) {
      await dropbox.filesUpload({
        path: caminho,
        contents: Buffer.from(''),
        mode: { '.tag': 'overwrite' }
      });
    }

    res.status(201).json({ sucesso: true, imovel: novoImovel });
  } catch (err) {
    console.error('[ERRO] Erro ao criar imóvel:', err);
    res.status(500).json({ erro: 'Erro ao criar imóvel: ' + err.message });
  }
};

// ---
// Atualizar o status de um imóvel
export const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validação de ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID do imóvel inválido.' });
  }

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
    console.error('[ERRO] Erro ao atualizar o status do imóvel:', err);
    res.status(500).json({ erro: 'Erro ao atualizar o status do imóvel: ' + err.message });
  }
};

// ---
// Listar todos os imóveis
export const listarImoveis = async (req, res) => {
  try {
    const imoveis = await Imovel.find({}); // Busca todos os imóveis

    for (const imovel of imoveis) {
      let imovelFoiAtualizado = false;

      // Pular imóveis com status 'concluído'
      if (imovel.status === 'concluído') {
          console.log(`[Migração na Leitura] Imóvel '${imovel.titulo}' (${imovel._id}) está concluído. Pulando verificação de links.`);
          continue;
      }

      if (imovel.imagens && imovel.imagens.length > 0) {
        // Usar um loop for tradicional para permitir a remoção de elementos
        for (let i = 0; i < imovel.imagens.length; i++) {
          const img = imovel.imagens[i];
          if (!img.link || img.link.includes('?dl=0')) {
            console.log(`[Migração na Leitura] Corrigindo link para imagem '${img.filename}' do imóvel '${imovel.titulo}'`);
            const dropboxPath = `/imoveis/${imovel._id}/imagens/${img.filename}`;
            const finalLink = await getOrCreateSharedLink(dropboxPath);

            if (finalLink) {
              imovel.imagens[i].link = finalLink;
              imovelFoiAtualizado = true;
            } else {
              console.warn(`[Migração na Leitura] Falha ao obter link para imagem ${img.filename}. Removendo entrada do DB.`);
              // **NOVA LÓGICA:** Remove a imagem do array se o link não pôde ser obtido
              imovel.imagens.splice(i, 1);
              i--; // Decrementa o índice porque um item foi removido, para não pular o próximo
              imovelFoiAtualizado = true;
            }
          }
        }
      }

      // Lógica para vídeos
      if (imovel.video) {
        if (!imovel.video.nome) {
          console.warn(`[Migração na Leitura] Vídeo para imóvel '${imovel.titulo}' (${imovel._id}) tem nome indefinido. Removendo entrada de vídeo.`);
          imovel.video = undefined;
          imovelFoiAtualizado = true;
        } else if (!imovel.video.link || imovel.video.link.includes('?dl=0')) {
          console.log(`[Migração na Leitura] Corrigindo link para vídeo '${imovel.video.nome}' do imóvel '${imovel.titulo}'`);
          const dropboxPath = `/imoveis/${imovel._id}/videos/${imovel.video.nome}`;
          const finalLink = await getOrCreateSharedLink(dropboxPath);
          if (finalLink) {
            imovel.video.link = finalLink;
            imovelFoiAtualizado = true;
          } else {
            console.warn(`[Migração na Leitura] Falha ao obter link para vídeo ${imovel.video.nome}. Removendo entrada do DB.`);
            // **NOVA LÓGICA:** Remove a entrada de vídeo se o link não pôde ser obtido
            imovel.video = undefined;
            imovelFoiAtualizado = true;
          }
        }
      }

      // Se o imóvel foi modificado, salve-o de volta no banco de dados
      if (imovelFoiAtualizado) {
        await imovel.save();
        console.log(`[Migração na Leitura] Imóvel '${imovel.titulo}' (${imovel._id}) atualizado no DB.`);
      }
    }

    if (!imoveis || imoveis.length === 0) {
      return res.status(404).json({ erro: 'Nenhum imóvel encontrado.' });
    }
    res.status(200).json(imoveis);
  } catch (err) {
    console.error('[ERRO] Erro ao listar imóveis:', err);
    res.status(500).json({ erro: 'Erro ao listar imóveis: ' + err.message });
  }
};

// ---
// Atualizar/Fazer upload do vídeo de um imóvel
export const atualizarVideo = async (req, res) => {
  const { id } = req.params;

  // Validação de ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID do imóvel inválido.' });
  }

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
    await uploadEmSessao(dropboxPath, req.file.buffer);

    // Usa a nova função auxiliar para obter ou criar o link compartilhado
    const finalLink = await getOrCreateSharedLink(dropboxPath);

    // **IMPORTANTE:** Garantir que 'nome' seja sempre definido aqui
    imovel.video = {
      nome: req.file.originalname, // <-- Garante que o nome do arquivo esteja sempre aqui!
      link: finalLink,
    };
    await imovel.save();

    res.status(200).json({ sucesso: true, video: imovel.video });
  } catch (err) {
    console.error('[ERRO] Erro ao atualizar o vídeo do imóvel:', err);
    res.status(500).json({ erro: 'Erro ao atualizar o vídeo do imóvel: ' + err.message });
  }
};

// ---
// Upload de múltiplas imagens para um imóvel
export const uploadImagens = async (req, res) => {
  const { id } = req.params;

  // Validação de ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID do imóvel inválido.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imóvel não encontrado.' });
    }

    const imagensSalvas = [];
    for (const file of req.files) {
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(file.mimetype)) {
        console.warn(`[AVISO] Arquivo ${file.originalname} ignorado: tipo não permitido (${file.mimetype})`);
        continue; // Pula para o próximo arquivo
      }

      const dropboxPath = `/imoveis/${id}/imagens/${file.originalname}`;
      await uploadEmSessao(dropboxPath, file.buffer);

      // Usa a nova função auxiliar para obter ou criar o link compartilhado
      const finalLink = await getOrCreateSharedLink(dropboxPath);

      const novaImagem = {
        nome: file.originalname, // Nome da imagem para exibição (pode ser diferente do filename)
        filename: file.originalname, // Nome do arquivo como está no Dropbox
        link: finalLink,
      };
      console.log(`[DEBUG] Nova imagem a ser adicionada:`, novaImagem);

      // Verifica se a imagem já existe pelo filename para atualizar ou adicionar
      const imagemExistenteIndex = imovel.imagens.findIndex(img => img.filename === novaImagem.filename);
      if (imagemExistenteIndex > -1) {
        imovel.imagens[imagemExistenteIndex] = novaImagem;
      } else {
        imovel.imagens.push(novaImagem);
      }
      imagensSalvas.push(novaImagem);
    }

    await imovel.save();
    res.status(200).json({ sucesso: true, imagens: imagensSalvas });

  } catch (err) {
    console.error('[ERRO] Erro ao fazer upload de imagens:', err);
    res.status(500).json({ erro: 'Erro ao fazer upload de imagens: ' + err.message });
  }
};

// ---
// Deletar uma imagem específica de um imóvel
export const deletarImagem = async (req, res) => {
  const { id, filename } = req.params; // id do imóvel e filename da imagem

  // Validação de ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID do imóvel inválido.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) {
      return res.status(404).json({ erro: 'Imagem não encontrada para este imóvel.' }); // Mensagem ajustada
    }

    const imagemParaRemover = imovel.imagens.find(img => img.filename === filename);
    if (!imagemParaRemover) {
      return res.status(404).json({ erro: 'Imagem não encontrada para este imóvel.' });
    }

    const dropboxPath = `/imoveis/${id}/imagens/${filename}`;

    // Tenta deletar o arquivo do Dropbox
    try {
      await dropbox.filesDeleteV2({ path: dropboxPath });
      console.log(`[Dropbox] Arquivo deletado: ${dropboxPath}`);
    } catch (dropboxErr) {
      if (dropboxErr?.error?.error_summary?.includes('path/not_found')) {
        console.warn(`[AVISO] Arquivo "${filename}" não encontrado no Dropbox. Removendo apenas do DB.`);
      } else {
        console.error(`[ERRO] Falha ao deletar arquivo "${filename}" do Dropbox:`, dropboxErr);
      }
    }

    // Remove a imagem do array no MongoDB
    imovel.imagens = imovel.imagens.filter(img => img.filename !== filename);
    await imovel.save();

    res.status(200).json({ sucesso: true, mensagem: 'Imagem excluída com sucesso.' });

  } catch (err) {
    console.error(`[ERRO] Erro ao deletar imagem ${filename} do imóvel ${id}:`, err);
    res.status(500).json({ erro: 'Erro ao excluir imagem: ' + err.message });
  }
};

// ---
// Deletar um imóvel (move a pasta do Dropbox para 'finalizados')
export const deletarImovel = async (req, res) => {
  const { id } = req.params;

  // Validação de ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ erro: 'ID do imóvel inválido.' });
  }

  try {
    const imovel = await Imovel.findById(id);
    if (!imovel) return res.status(200).json({ success: true, message: 'Imóvel não encontrado no DB, presumindo já excluído.' });

    // **NOVA LÓGICA:** Marcar o status como 'concluído' ANTES de remover do DB,
    // para que a lógica de listagem (fix-on-read) possa pular este item se for processado
    // antes que a exclusão do DB seja efetivada ou se houver um erro de rede.
    imovel.status = 'concluído';
    await imovel.save(); // Salva a mudança de status antes de deletar

    await Imovel.findByIdAndDelete(id); // Exclui do MongoDB

    const caminhoOriginal = `/imoveis/${id}`;
    const caminhoFinalizado = `/finalizados/${id}`;

    // Verifica se a pasta existe no Dropbox antes de tentar mover
    try {
      await dropbox.filesGetMetadata({ path: caminhoOriginal });
    } catch (err) {
      if (err?.error?.error_summary?.includes('path/not_found')) {
        console.warn('[AVISO] Pasta de origem não encontrada no Dropbox, assumindo que já foi movida ou excluída:', caminhoOriginal);
        return res.status(200).json({ success: true, message: 'Imóvel excluído do DB, pasta Dropbox já ausente.' });
      }
      console.error('[ERRO] Erro ao verificar pasta de origem no Dropbox:', caminhoOriginal, err);
      // Retorna erro se a verificação falhar criticamente e não for 'not_found'
      return res.status(500).json({ success: false, error: 'Erro ao verificar pasta no Dropbox.' });
    }

    try {
      await dropbox.filesMoveV2({
        from_path: caminhoOriginal,
        to_path: caminhoFinalizado,
        autorename: true,
      });
      console.log(`[Dropbox] Pasta do imóvel movida de ${caminhoOriginal} para ${caminhoFinalizado}`);
    } catch (err) {
      console.error('[ERRO] Falha ao mover arquivos no Dropbox:', err);
      // Retorna erro, mas informa que o imóvel foi removido do DB
      return res.status(500).json({ success: false, error: 'Erro ao mover arquivos no Dropbox, mas imóvel removido do DB.' });
    }

    res.status(200).json({ success: true, message: 'Imóvel excluído com sucesso e pasta movida no Dropbox.' });
  } catch (err) {
    console.error('[ERRO] Erro geral ao deletar imóvel:', err);
    res.status(500).json({ success: false, error: 'Erro ao tentar excluir imóvel: ' + err.message });
  }
};

// ---
// Atualizar informações gerais de um imóvel
export const atualizarImovel = async (req, res) => {
  const { id } = req.params;
  const dadosAtualizados = req.body;

  // Validação de ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ mensagem: 'ID do imóvel inválido.' });
  }

  try {
    const imovel = await Imovel.findByIdAndUpdate(id, dadosAtualizados, { new: true });
    if (!imovel) return res.status(404).json({ mensagem: 'Imóvel não encontrado' });
    res.json(imovel);
  } catch (err) {
    console.error('[ERRO] Erro ao atualizar imóvel:', err);
    res.status(500).json({ mensagem: 'Erro ao atualizar imóvel' });
  }
};

// ---
// Atualizar a ordem de exibição dos imóveis
export const atualizarOrdem = async (req, res) => {
  const { novaOrdem } = req.body;

  if (!Array.isArray(novaOrdem) || novaOrdem.length === 0) {
    return res.status(400).json({ message: 'Array novaOrdem inválido ou vazio.' });
  }

  try {
    const operations = novaOrdem.map((item, index) => {
      // Valida se o _id é um ObjectId válido antes de tentar usar
      if (!mongoose.Types.ObjectId.isValid(item._id)) {
        console.warn(`[AVISO] ID inválido na novaOrdem: ${item._id}. Pulando este item.`);
        return null;
      }
      return Imovel.findByIdAndUpdate(item._id, { ordem: index });
    }).filter(op => op !== null); // Filtra as operações nulas (para IDs inválidos)

    // Executa todas as atualizações em paralelo para melhor performance
    await Promise.all(operations);

    res.status(200).json({ message: 'Ordem atualizada com sucesso!' });
  } catch (error) {
    console.error('[ERRO] Erro ao atualizar a ordem dos imóveis:', error);
    res.status(500).json({ message: 'Erro ao atualizar a ordem' });
  }
};

// ---
// Buscar o último imóvel (com a maior ordem)
export const buscarUltimoImovel = async (req, res) => {
  try {
    const ultimoImovel = await Imovel.findOne().sort({ ordem: -1 });
    if (!ultimoImovel) {
      return res.status(404).json({ message: 'Nenhum imóvel encontrado' });
    }
    res.json(ultimoImovel);
  } catch (err) {
    console.error('[ERRO] Erro ao buscar o último imóvel:', err);
    res.status(500).json({ message: 'Erro ao buscar o último imóvel' });
  }
};