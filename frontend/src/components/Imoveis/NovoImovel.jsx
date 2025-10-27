import { useState, useEffect } from 'react';
import api from '../../api/api'; // ✅ Importa a instância configurada
import styles from '../../styles/ModalNovo.module.css';
import { FiTrash } from 'react-icons/fi';
import { MdOutlineClose } from "react-icons/md";

export default function ModalNovoImovel({ onClose, onCriar }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('cadastrar');
  const [arquivosImagens, setArquivosImagens] = useState([]);
  const [arquivoVideo, setArquivoVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [previewImagens, setPreviewImagens] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Gera pré-visualização das imagens
  useEffect(() => {
    const imagensPreview = arquivosImagens.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviewImagens(imagensPreview);

    return () => {
      imagensPreview.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [arquivosImagens]);

  // Gera pré-visualização do vídeo
  useEffect(() => {
    if (arquivoVideo) {
      const videoPreview = {
        file: arquivoVideo,
        url: URL.createObjectURL(arquivoVideo),
      };
      setPreviewVideo(videoPreview);
      return () => URL.revokeObjectURL(videoPreview.url);
    } else {
      setPreviewVideo(null);
    }
  }, [arquivoVideo]);

  const handleCreate = async () => {
    if (!titulo.trim()) {
      alert('O campo título é obrigatório.');
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ Cria o imóvel no backend
      const response = await api.post('/imoveis', {
        titulo,
        descricao,
        status,
      });

      const novoImovel = response.data.imovel;

      // 2️⃣ Upload das imagens (se houver)
      if (arquivosImagens.length > 0) {
        const formDataImagens = new FormData();
        arquivosImagens.forEach(file => {
          formDataImagens.append('arquivos', file);
        });

        await api.post(`/imoveis/${novoImovel._id}/imagens`, formDataImagens, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 3️⃣ Upload do vídeo (se houver)
      if (arquivoVideo) {
        const formDataVideo = new FormData();
        formDataVideo.append('arquivo', arquivoVideo);

        await api.patch(`/imoveis/${novoImovel._id}/video`, formDataVideo, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      alert('Imóvel criado com sucesso e arquivos enviados!');
      onCriar();
      onClose();

    } catch (err) {
      console.error('Erro ao criar imóvel:', err.response?.data || err.message);
      alert('Erro ao criar imóvel: ' + (err.response?.data?.erro || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.modal} ${styles.novoImovel}`}>
      <div className={styles.modalContent}>
        <div className={styles.topButtons}>
          <button className={styles.closeButton} onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        <div className={styles.body}>
          <h2>Novo Imóvel</h2>

          <label>Título</label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />

          <label>Descrição</label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />

          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="cadastrar">Cadastrar</option>
            <option value="fazer video">Fazer Vídeo</option>
            <option value="fazer tour 360º">Fazer Tour 360º</option>
            <option value="concluído">Concluído</option>
          </select>

          {/* Upload e preview das imagens */}
          <label>Imagens</label>
          <input
            type="file"
            id="inputImagem"
            style={{ display: 'none' }}
            multiple
            accept="image/*"
            onChange={e => setArquivosImagens(Array.from(e.target.files))}
          />
          <label htmlFor="inputImagem" className={styles.botaoUpload}>
            Adicionar imagem(ns)
          </label>

          {previewImagens.length > 0 && (
            <div className={styles.previewContainer}>
              {previewImagens.map(({ url }, index) => (
                <div key={index} className={styles.imagemPreviewWrapper}>
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className={styles.imagemPreview}
                  />
                  <div className={styles.imagemOverlay}>
                    <button
                      className={styles.iconeLixeira}
                      onClick={() =>
                        setArquivosImagens(prev => prev.filter((_, i) => i !== index))
                      }
                      title="Remover da seleção"
                    >
                      <FiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload e preview do vídeo */}
          <label>Vídeo</label>
          <input
            type="file"
            id="inputVideo"
            style={{ display: 'none' }}
            accept="video/mp4"
            onChange={e => setArquivoVideo(e.target.files[0] || null)}
          />
          <label htmlFor="inputVideo" className={styles.botaoUpload}>
            Adicionar vídeo (MP4)
          </label>

          {previewVideo && (
            <div className={styles.previewContainer}>
              <div className={styles.imagemPreviewWrapper}>
                <video
                  src={previewVideo.url}
                  controls
                  className={styles.imagemPreview}
                />
                <div className={styles.imagemOverlay}>
                  <button
                    className={styles.iconeLixeira}
                    onClick={() => setArquivoVideo(null)}
                    title="Remover vídeo"
                  >
                    <FiTrash />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.footerButtons}>
            <button
              className={styles.saveButton}
              onClick={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? 'Criando Imóvel...' : 'Criar Imóvel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
