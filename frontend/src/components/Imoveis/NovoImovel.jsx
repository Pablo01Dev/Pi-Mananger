import { useState } from 'react';
import api from '../../api'; // ✅ usa o axios configurado
import styles from '../../styles/ModalNovo.module.css';
import { MdOutlineClose } from "react-icons/md";

export default function ModalNovoImovel({ onClose, onCriar }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('cadastrar');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!titulo.trim()) {
      alert('O campo título é obrigatório.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/imoveis', { titulo, descricao, status });

      alert('Imóvel criado com sucesso!');
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
