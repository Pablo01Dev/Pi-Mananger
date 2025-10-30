import { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/ModalNovo.module.css';
import { MdOutlineClose } from 'react-icons/md';

const API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/placas`
    : 'http://localhost:5000/api/placas';

const MATERIAL_OPTIONS = [
  { value: 'Lona', label: 'Lona' },
  { value: 'Adesivo', label: 'Adesivo' }
];

const TIPO_OPTIONS = [
  { value: 'Alugue', label: 'Alugue' },
  { value: 'Compre', label: 'Compre' },
  { value: 'Alugue ou compre', label: 'Alugue / Compre' },
  { value: 'Outros', label: 'Outro' },
];

export default function NovaPlaca({ onClose, onCriar }) {
  const [formData, setFormData] = useState({
    // 🟡 Aqui é o ponto: título inicial já vem preenchido com “Padrão”
    titulo: 'Padrão',
    largura: '',
    altura: '',
    material: MATERIAL_OPTIONS[0]?.value || 'Lona',
    tipo: TIPO_OPTIONS[0]?.value || 'Alugue',
    quantidade: 1,
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
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setFeedbackMessage({ type: '', text: '' });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.titulo.trim()) tempErrors.titulo = "Título é obrigatório.";
    if (!formData.largura || parseFloat(formData.largura) <= 0)
      tempErrors.largura = "Largura deve ser um número positivo.";
    if (!formData.altura || parseFloat(formData.altura) <= 0)
      tempErrors.altura = "Altura deve ser um número positivo.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setFeedbackMessage({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        largura: parseFloat(formData.largura),
        altura: parseFloat(formData.altura),
        quantidade: parseInt(formData.quantidade) || 1,
        status: 'produzir',
      };

      const res = await axios.post(API_URL, payload);

      let createdCount = 1;
      if (Array.isArray(res.data.placas)) {
        createdCount = res.data.placas.length;
      }

      setFeedbackMessage({
        type: 'success',
        text:
          createdCount > 1
            ? `${createdCount} placas criadas com sucesso!`
            : 'Placa criada com sucesso!',
      });

      if (onCriar) onCriar(res.data);
      setTimeout(onClose, 800);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Erro desconhecido ao criar material.';
      console.error('Erro ao criar material:', errorMsg);
      setFeedbackMessage({ type: 'error', text: `Erro: ${errorMsg}` });
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

        <form onSubmit={handleSubmit} className={styles.body}>
          <h2>Nova Placa</h2>

          {feedbackMessage.text && (
            <div
              className={
                feedbackMessage.type === 'error'
                  ? styles.errorMessage
                  : styles.successMessage
              }
            >
              {feedbackMessage.text}
            </div>
          )}

          <label>Título</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ex: Alugue já!"
          />
          {errors.titulo && <span className={styles.errorText}>{errors.titulo}</span>}

          <label>Largura (cm)</label>
          <input
            type="number"
            name="largura"
            value={formData.largura}
            onChange={handleChange}
            step="any"
          />
          {errors.largura && <span className={styles.errorText}>{errors.largura}</span>}

          <label>Altura (cm)</label>
          <input
            type="number"
            name="altura"
            value={formData.altura}
            onChange={handleChange}
            step="any"
          />
          {errors.altura && <span className={styles.errorText}>{errors.altura}</span>}

          <label>Material</label>
          <select name="material" value={formData.material} onChange={handleChange}>
            {MATERIAL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label>Tipo</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange}>
            {TIPO_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label>Quantidade</label>
          <input
            type="number"
            name="quantidade"
            value={formData.quantidade}
            onChange={handleChange}
            min="1"
            step="1"
          />

          <label>Observação</label>
          <textarea
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
              {isLoading ? 'Criando...' : 'Criar Placa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
