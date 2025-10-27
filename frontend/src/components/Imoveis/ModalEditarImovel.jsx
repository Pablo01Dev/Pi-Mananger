import { useState, useEffect } from 'react';
import api from '../../api/api'; // ✅ Usa a instância central configurada
import styles from '../../styles/ModalNovo.module.css';
import { MdDelete } from "react-icons/md";
import { MdOutlineClose } from "react-icons/md";

export default function ModalEditarImovel({ imovel, onClose, onAtualizar, onExcluir }) {

  // 🔍 Depuração (opcional, pode remover depois)
  useEffect(() => {
    console.log("🟡 Imóvel recebido:", imovel);
  }, [imovel]);

  const [titulo, setTitulo] = useState(imovel.titulo);
  const [descricao, setDescricao] = useState(imovel.descricao);
  const [status, setStatus] = useState(imovel.status);
  const [novasImagensParaUpload, setNovasImagensParaUpload] = useState([]);
  const [videosParaUpload, setVideosParaUpload] = useState([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [imagensExistentes, setImagensExistentes] = useState(imovel.imagens || []);
  const [imagensParaExcluir, setImagensParaExcluir] = useState([]);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // ✅ Atualiza imóvel completo
  const handleUpdate = async () => {
    try {
      // 1️⃣ Atualiza dados básicos
      await api.put(`/imoveis/${imovel._id}`, { titulo, descricao, status });

      // 2️⃣ Upload de novas imagens
      if (novasImagensParaUpload.length > 0) {
        const formDataImg = new FormData();
        novasImagensParaUpload.forEach(file => {
          formDataImg.append('arquivos', file);
        });

        const response = await api.post(
          `/imoveis/${imovel._id}/imagens`,
          formDataImg,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        setImagensExistentes(prev => [...prev, ...response.data.imagens]);
      }

      // 3️⃣ Upload de vídeo (único)
      if (videosParaUpload.length > 0) {
        const formDataVid = new FormData();
        formDataVid.append('arquivo', videosParaUpload[0]);

        await api.post(
          `/imoveis/${imovel._id}/videos`,
          formDataVid,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // 4️⃣ Exclui imagens marcadas
      for (const filename of imagensParaExcluir) {
        try {
          await api.delete(`/imoveis/${imovel._id}/imagens/${filename}`);
        } catch (err) {
          console.error(`Erro ao excluir ${filename}:`, err.response?.data || err.message);
        }
      }

      alert('Atualização concluída!');
      if (onAtualizar) onAtualizar();
      onClose();

    } catch (err) {
      console.error('Erro ao atualizar imóvel:', err.response?.data || err.message);
      alert('Erro ao atualizar imóvel.');
    }
  };

  // ✅ Exclusão total do imóvel
  const handleDeleteImovel = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const response = await api.delete(`/imoveis/${imovel._id}`);
      if (response.status === 200) {
        alert('Imóvel excluído com sucesso!');
        if (onExcluir) onExcluir(imovel._id);
        setMostrarConfirmacao(false);
        setTimeout(onClose, 300);
      }
    } catch (err) {
      console.error('Erro ao excluir imóvel:', err);
      alert('Erro ao excluir imóvel.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Marca imagem para exclusão
  const handleDeleteImage = (filename) => {
    setImagensExistentes(prev => prev.filter(img => img.filename !== filename));
    setImagensParaExcluir(prev => [...prev, filename]);
  };

  // Upload de novas imagens
  const handleNewImageChange = (e) => {
    setNovasImagensParaUpload(Array.from(e.target.files));
  };

  // Upload de vídeo
  const handleVideoChange = (e) => {
    setVideosParaUpload(Array.from(e.target.files));
  };

  // Navegação no carrossel
  const nextImage = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % imagensExistentes.length);
  };
  const prevImage = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + imagensExistentes.length) % imagensExistentes.length);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.topButtons}>
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              setMostrarConfirmacao(true);
            }}
          >
            <MdDelete />
            <span className={styles.tooltip}>Excluir imóvel</span>
          </button>
          <button className={styles.closeButton} onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}>
            <MdOutlineClose />
          </button>
        </div>

        {/* Corpo */}
        <div className={styles.body}>
          <h2>Editar Imóvel</h2>
          <label>Título</label>
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} />

          <label>Descrição</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} />

          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="cadastrar">Cadastrar</option>
            <option value="fazer video">Fazer Vídeo</option>
            <option value="fazer tour 360º">Fazer Tour 360º</option>
            <option value="concluído">Concluído</option>
          </select>
        </div>

        {/* Imagens Existentes */}
        <div className={styles.arquivoUpload}>
          <label>Imagens Existentes</label>
          {imagensExistentes?.length > 0 ? (
            <div className={styles.existingImagesContainer}>
              {imagensExistentes.map((img, index) => (
                img.link ? (
                  <div key={img.filename || index} className={styles.imagemPreviewWrapper}>
                    <img
                      src={img.link.replace('dl=0', 'raw=1')}
                      alt={img.filename || `Imagem ${index + 1}`}
                      className={styles.imagemPreview}
                      onClick={() => { setShowCarousel(true); setCurrentCarouselIndex(index); }}
                    />
                    <div className={styles.imagemOverlay}>
                      <button
                        className={styles.iconeLixeira}
                        onClick={() => handleDeleteImage(img.filename)}
                        title="Remover imagem existente"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={img.filename || index} className={styles.imagemPreviewWrapper}>
                    <p className={styles.noImageLink}>Link não disponível.</p>
                  </div>
                )
              ))}
            </div>
          ) : (
            <p>Nenhuma imagem existente para este imóvel.</p>
          )}

          {/* Novas imagens */}
          <label>Adicionar Novas Imagens</label>
          <input
            type="file"
            id="inputNovasImagens"
            style={{ display: 'none' }}
            multiple
            accept="image/*"
            onChange={handleNewImageChange}
          />
          <label htmlFor="inputNovasImagens" className={styles.botaoUpload}>
            Selecionar Novas Imagens
          </label>

          {novasImagensParaUpload.length > 0 && (
            <div className={styles.previewContainer}>
              <h4>Imagens para Upload:</h4>
              {novasImagensParaUpload.map((file, index) => (
                <div key={index} className={styles.imagemPreviewWrapper}>
                  <img src={URL.createObjectURL(file)} alt={`nova-${index}`} className={styles.imagemPreview} />
                  <div className={styles.imagemOverlay}>
                    <button
                      className={styles.iconeLixeira}
                      onClick={() => setNovasImagensParaUpload(prev => prev.filter((_, i) => i !== index))}
                      title="Remover da seleção"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vídeo */}
          <label>Vídeo</label>
          {imovel.video?.link && (
            <div className={styles.videoPreviewContainer}>
              <video controls className={styles.videoPreview}>
                <source src={imovel.video.link} type="video/mp4" />
              </video>
              <p>Vídeo atual: {imovel.video.nome || 'Sem nome'}</p>
            </div>
          )}

          <label>Adicionar/Substituir Vídeo</label>
          <input
            type="file"
            id="inputVideo"
            style={{ display: 'none' }}
            accept="video/mp4"
            onChange={handleVideoChange}
          />
          <label htmlFor="inputVideo" className={styles.botaoUpload}>
            Selecionar Novo Vídeo (MP4)
          </label>

          {videosParaUpload.length > 0 && (
            <p>Vídeo selecionado: {videosParaUpload[0].name}</p>
          )}

          <div className={styles.footerButtons}>
            <button className={styles.saveButton} onClick={handleUpdate}>Salvar alterações</button>
          </div>
        </div>
      </div>

      {/* 🖼️ Carrossel */}
      {showCarousel && imagensExistentes.length > 0 && (
        <div className={styles.carouselOverlay} onClick={() => setShowCarousel(false)}>
          <div className={styles.carousel} onClick={(e) => e.stopPropagation()}>
            {imagensExistentes.length > 1 && (
              <>
                <button className={styles.carouselNavButtonLeft} onClick={prevImage}>❮</button>
                <button className={styles.carouselNavButtonRight} onClick={nextImage}>❯</button>
              </>
            )}
            <div className={styles.carouselItem}>
              {imagensExistentes[currentCarouselIndex]?.link ? (
                <img
                  src={imagensExistentes[currentCarouselIndex].link}
                  alt={imagensExistentes[currentCarouselIndex]?.filename || 'Imagem do carrossel'}
                />
              ) : (
                <p className={styles.noImageLink}>Link da imagem não disponível.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Modal de Confirmação de Exclusão */}
      {mostrarConfirmacao && (
        <div className={styles.confirmacaoOverlay} onClick={() => !isDeleting && setMostrarConfirmacao(false)}>
          <div className={styles.confirmacaoModal} onClick={(e) => e.stopPropagation()}>
            <h3>Tem certeza que deseja excluir este imóvel?</h3>
            <div className={styles.botoesConfirmacao}>
              <button
                className={styles.confirmarButton}
                onClick={handleDeleteImovel}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
              <button
                className={styles.cancelarButton}
                onClick={() => setMostrarConfirmacao(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
