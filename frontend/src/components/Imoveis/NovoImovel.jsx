import { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/ModalNovo.module.css';
import { FiTrash } from 'react-icons/fi';
import { MdOutlineClose } from "react-icons/md";

export default function ModalNovoImovel({ onClose, onCriar }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('cadastrar');
  const [arquivos, setArquivos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  // Controle de estado de carregamento

  const handleCreate = async () => {
    if (!titulo.trim()) {
      alert('O campo título é obrigatório.');
      return;
    }

    setIsLoading(true);

    try {
      console.log({ titulo, descricao, status });
      const response = await axios.post('http://localhost:5000/api/imoveis', {
        titulo,
        descricao,
        status,
      });

      const novoImovel = response.data;

      // Função para upload de imagens
      const uploadImagens = async () => {
        for (const img of arquivos) {
          const formDataImg = new FormData();
          formDataImg.append('arquivo', img);
          await axios.post(
            `http://localhost:5000/api/imoveis/${novoImovel._id}/upload`,
            formDataImg, // ou formDataVid
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }
      };

      // Função para upload de vídeos
      const uploadVideos = async () => {
        for (const vid of videos) {
          const formDataVid = new FormData();
          formDataVid.append('arquivo', vid);
          await axios.post(
            `http://localhost:5000/api/imoveis/${novoImovel._id}/upload`,
            formDataVid, // ✅ Corrigido
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );

        }
      };

      // Executa os uploads de forma controlada
      await uploadImagens();
      await uploadVideos();

      alert('Imóvel criado com sucesso!');
      onCriar(); // Chama a função passada via prop

      onClose(); // Fecha o modal

    } catch (err) {
      console.error('Erro ao criar imóvel:', err.response?.data || err.message);
      alert('Erro ao criar imóvel.');
    } finally {
      setIsLoading(false);  // Finaliza o carregamento
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

          <label>Imagens</label>
          <input
            type="file"
            id="inputImagem"
            style={{ display: 'none' }}
            multiple
            accept="image/*"
            onChange={e => setArquivos(Array.from(e.target.files))}
          />
          <label htmlFor="inputImagem" className={styles.botaoUpload}>
            Adicionar imagem
          </label>

          {arquivos.length > 0 && (
            <div className={styles.previewContainer}>
              {arquivos.map((file, index) => (
                <div key={index} className={styles.imagemPreviewWrapper}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className={styles.imagemPreview}
                  />
                  <div className={styles.imagemOverlay}>
                    <button
                      className={styles.iconeLixeira}
                      onClick={() =>
                        setArquivos(prev => prev.filter((_, i) => i !== index))
                      }
                    >
                      <FiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label>Vídeos</label>
          <input
            type="file"
            id="inputVideo"
            style={{ display: 'none' }}
            multiple
            accept="video/mp4"
            onChange={e => setVideos(Array.from(e.target.files))}
          />
          <label htmlFor="inputVideo" className={styles.botaoUpload}>
            Adicionar vídeo
          </label>

          <div className={styles.footerButtons}>
            <button
              className={styles.saveButton}
              onClick={handleCreate}
              disabled={isLoading}  // Desabilita o botão durante o carregamento
            >
              {isLoading ? 'Criando Imóvel...' : 'Criar Imóvel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
