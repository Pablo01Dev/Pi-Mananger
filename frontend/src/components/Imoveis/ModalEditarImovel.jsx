import { useState } from 'react';
import api from '../../api';
import styles from '../../styles/ModalNovo.module.css';
import { MdDelete, MdOutlineClose } from "react-icons/md";

export default function ModalEditarImovel({ imovel, onClose, onAtualizar, onExcluir }) {
  const [titulo, setTitulo] = useState(imovel.titulo || '');
  const [descricao, setDescricao] = useState(imovel.descricao || '');
  const [status, setStatus] = useState(imovel.status || 'cadastrar');
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Atualiza dados do imóvel
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await api.put(`/imoveis/${imovel._id}`, { titulo, descricao, status });
      alert('Imóvel atualizado com sucesso!');
      if (onAtualizar) onAtualizar();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar imóvel:', err.response?.data || err.message);
      alert('Erro ao atualizar imóvel.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Exclui imóvel
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

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        {/* Topo */}
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

          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <MdOutlineClose />
          </button>
        </div>

        {/* Corpo */}
        <div className={styles.body}>
          <h2>Editar Imóvel</h2>

          <label>Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <label>Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="cadastrar">Cadastrar</option>
            <option value="fazer video">Fazer Vídeo</option>
            <option value="fazer tour 360º">Fazer Tour 360º</option>
            <option value="concluído">Concluído</option>
          </select>

          <div className={styles.footerButtons}>
            <button
              className={styles.saveButton}
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmação de exclusão */}
      {mostrarConfirmacao && (
        <div
          className={styles.confirmacaoOverlay}
          onClick={() => !isDeleting && setMostrarConfirmacao(false)}
        >
          <div
            className={styles.confirmacaoModal}
            onClick={(e) => e.stopPropagation()}
          >
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
