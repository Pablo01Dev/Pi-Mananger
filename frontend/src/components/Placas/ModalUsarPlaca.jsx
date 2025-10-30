import { useState } from 'react';
import styles from '../../styles/ModalUsarPlaca.module.css';
import { MdOutlineClose, MdAdd, MdRemove } from "react-icons/md";

export default function ModalUsarPlaca({ placa, onConfirm, onClose }) {
  const [quantidadeUsar, setQuantidadeUsar] = useState(1);

  const handleConfirm = () => {
    if (quantidadeUsar <= 0) return alert("Quantidade inválida");
    onConfirm(placa, quantidadeUsar);
  };

  const diminuir = () => {
    setQuantidadeUsar(prev => (prev > 1 ? prev - 1 : 1));
  };

  const aumentar = () => {
    setQuantidadeUsar(prev => (prev < placa.quantidade ? prev + 1 : prev));
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.topButtons}>
          <button className={styles.closeButton} onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        <div className={styles.body}>
          <h2>Usar placa</h2>
          <p><b>{placa.titulo}</b></p>
          <p>Tamanho: {placa.largura}x{placa.altura} cm</p>
          <p>Quantidade disponível: {placa.quantidade}</p>

          <label>Quantas placas deseja usar?</label>

          <div className={styles.counterContainer}>
            <button
              type="button"
              className={styles.counterButton}
              onClick={diminuir}
              disabled={quantidadeUsar <= 1}
            >
              <MdRemove />
            </button>

            <span className={styles.counterValue}>{quantidadeUsar}</span>

            <button
              type="button"
              className={styles.counterButton}
              onClick={aumentar}
              disabled={quantidadeUsar >= placa.quantidade}
            >
              <MdAdd />
            </button>
          </div>

          <div className={styles.footerButtons}>
            <button
              className={styles.saveButton}
              onClick={handleConfirm}
            >
              Confirmar uso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
