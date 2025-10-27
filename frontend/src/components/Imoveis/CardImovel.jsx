import { useState } from 'react';
import ModalEditarImovel from './ModalEditarImovel';
import styles from '../../styles/CardImovel.module.css';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'cadastrar':
      return '#DD2257';
    case 'fazer video':
      return '#1E90FF';
    case 'fazer tour 360º':
      return '#FF9D00';
    case 'concluído':
      return '#54D763';
    default:
      return 'black';
  }
};

export default function CardImovel({ imovel, onAtualizar, onExcluir }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div
      className={styles.cardImovel}
      onClick={() => setIsModalOpen(true)}
    >
      <div className={styles.statusBar}>
        <p>{imovel.status}</p>
        <div
          className={styles.statusColor}
          style={{ backgroundColor: getStatusColor(imovel.status) }}
        />
      </div>

      <h3>{imovel.titulo}</h3>
      {imovel.descricao && (
        <p className={styles.descriptCard}>{imovel.descricao}</p>
      )}

      <div className={styles.date}>
        {imovel.criadoEm && <p>Criado em: {formatDate(imovel.criadoEm)}</p>}
      </div>

      {isModalOpen && (
        <ModalEditarImovel
          imovel={imovel}
          onClose={() => setIsModalOpen(false)}
          onAtualizar={onAtualizar}
          onExcluir={onExcluir}
        />
      )}
    </div>
  );
}
