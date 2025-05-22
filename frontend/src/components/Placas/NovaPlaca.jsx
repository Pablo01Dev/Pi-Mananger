import { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/ModalNovo.module.css'; // reutilizando seu CSS
import { MdOutlineClose } from 'react-icons/md';

export default function NovaPlaca({ onClose, onCriar }) {
  const [titulo, setTitulo] = useState('');
  const [largura, setLargura] = useState('');
  const [altura, setAltura] = useState('');
  const [material, setMaterial] = useState('Lona');
  const [tipo, setTipo] = useState('Alugue');
  const [observacao, setObservacao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/placas', {
        titulo,
        largura: parseFloat(largura),
        altura: parseFloat(altura),
        material,
        tipo,
        observacao,
        status: 'produzir',
      });

      alert('Material criado com sucesso!');
      onCriar(); // callback externo
      onClose(); // fecha modal
    } catch (err) {
      console.error('Erro ao criar material:', err.response?.data || err.message);
      alert('Erro ao criar material.');
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
          <h2>Novo Material</h2>

          <label>Título</label>
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} />

          <label>Largura (cm)</label>
          <input type="number" value={largura} onChange={e => setLargura(e.target.value)} />

          <label>Altura (cm)</label>
          <input type="number" value={altura} onChange={e => setAltura(e.target.value)} />

          <label>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value)}>
            <option value="Lona">Lona</option>
            <option value="Adesivo">Adesivo</option>
          </select>

          <label>Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="Alugue">Alugue</option>
            <option value="Compre">Compre</option>
            <option value="Alugue ou compre">Alugue ou compre</option>
            <option value="Outros">Outros</option>
          </select>

          <label>Observação</label>
          <textarea value={observacao} onChange={e => setObservacao(e.target.value)} />

          <div className={styles.footerButtons}>
            <button 
              className={styles.saveButton} 
              onClick={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Material'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
