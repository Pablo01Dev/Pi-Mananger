import { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/ModalNovo.module.css';
import { MdOutlineClose } from 'react-icons/md';

const API_URL = 'http://localhost:5000/api/placas';

const MATERIAL_OPTIONS = [
  { value: 'Lona', label: 'Lona' },
  { value: 'Adesivo', label: 'Adesivo' }
];

const TIPO_OPTIONS = [
  { value: 'Alugue', label: 'Alugue' },
  { value: 'Compre', label: 'Compre' },  // Corrigido para "Compre" com C maiúsculo
  { value: 'Alugue ou compre', label: 'Alugue / Compre' },  // Igual ao enum
  { value: 'Outros', label: 'Outro' },   // Igual ao enum
];


export default function NovaPlaca({ onClose, onCriar }) {
  const [formData, setFormData] = useState({
    titulo: '',
    largura: '',
    altura: '',
    material: MATERIAL_OPTIONS[0]?.value || 'Lona',
    tipo: TIPO_OPTIONS[0]?.value || 'Alugue',
    quantidade: '',
    observacao: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
    setFeedbackMessage({ type: '', text: '' });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.titulo.trim()) tempErrors.titulo = "Título é obrigatório.";
    if (!formData.largura || isNaN(parseFloat(formData.largura)) || parseFloat(formData.largura) <= 0) {
      tempErrors.largura = "Largura deve ser um número positivo.";
    }
    if (!formData.altura || isNaN(parseFloat(formData.altura)) || parseFloat(formData.altura) <= 0) {
      tempErrors.altura = "Altura deve ser um número positivo.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedbackMessage({ type: '', text: '' });

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        largura: parseFloat(formData.largura),
        altura: parseFloat(formData.altura),
        status: 'produzir',
      };
      await axios.post(API_URL, payload);

      setFeedbackMessage({ type: 'success', text: 'Material criado com sucesso!' });
      onCriar();
      onClose();

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Erro desconhecido ao criar material.';
      console.error('Erro ao criar material:', err.response?.data || err.message);
      setFeedbackMessage({ type: 'error', text: `Erro ao criar material: ${errorMsg}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.modal} ${styles.novoImovel}`}>
      <div className={styles.modalContent}>
        <div className={styles.topButtons}>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
            <MdOutlineClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <h2>Novo Material</h2>

          {feedbackMessage.text && (
            <div className={feedbackMessage.type === 'error' ? styles.errorMessage : styles.successMessage}>
              {feedbackMessage.text}
            </div>
          )}

          <label htmlFor="tituloInput">Título</label>
          <input
            id="tituloInput"
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
          />
          {errors.titulo && <span className={styles.errorText}>{errors.titulo}</span>}

          <label htmlFor="larguraInput">Largura (cm)</label>
          <input
            id="larguraInput"
            type="number"
            name="largura"
            value={formData.largura}
            onChange={handleChange}
            step="any"
          />
          {errors.largura && <span className={styles.errorText}>{errors.largura}</span>}

          <label htmlFor="alturaInput">Altura (cm)</label>
          <input
            id="alturaInput"
            type="number"
            name="altura"
            value={formData.altura}
            onChange={handleChange}
            step="any"
          />
          {errors.altura && <span className={styles.errorText}>{errors.altura}</span>}

          <label htmlFor="materialInput">Material</label>
          <select id="materialInput" name="material" value={formData.material} onChange={handleChange}>
            {MATERIAL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <label htmlFor="tipoInput">Tipo</label>
          <select id="tipoInput" name="tipo" value={formData.tipo} onChange={handleChange}>
            {TIPO_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <label htmlFor="quantidadeInput">Quantidade</label>
          <input
            id="quantidadeInput"
            type="number"
            name="quantidade"
            value={formData.quantidade}
            onChange={handleChange}
            step="1"
          />
          {errors.quantidade && <span className={styles.errorText}>{errors.quantidade}</span>}

          <label htmlFor="observacaoInput">Observação</label>
          <textarea
            id="observacaoInput"
            name="observacao"
            value={formData.observacao}
            onChange={handleChange}
          />

          <div className={styles.footerButtons}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
