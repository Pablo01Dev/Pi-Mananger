import { useState } from 'react';
import api from '../../api';
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
    const res = await api.post('/imoveis', { titulo, descricao, status });

    // ✅ Aceita tanto 200 quanto 201 (Created)
    if (res.status === 200 || res.status === 201) {
      alert('Imóvel criado com sucesso!');
      if (onCriar) onCriar(res.data); // passa o imóvel criado para o pai
      onClose();
    } else {
      console.warn('Resposta inesperada:', res);
      alert('Servidor respondeu com código inesperado.');
    }
  } catch (err) {
    console.error('Erro ao criar imóvel:', err);
    const msg = err.response?.data?.erro || err.message || 'Erro desconhecido';
    alert('Erro ao criar imóvel: ' + msg);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className={`${styles.modal} ${styles.novoImovel}`}>
      <div className={styles.modalContent}>
        {/* Botão de fechar */}
        <div className={styles.topButtons}>
          <button className={styles.closeButton} onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        {/* Corpo do modal */}
        <div className={styles.body}>
          <h2>Novo Imóvel</h2>

          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Cobertura em Icaraí"
          />

          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Breve descrição do imóvel..."
          />

          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
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
              {isLoading ? 'Criando...' : 'Criar Imóvel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
