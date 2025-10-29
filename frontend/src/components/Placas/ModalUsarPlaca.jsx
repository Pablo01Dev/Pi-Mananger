import { useState } from 'react';
import styles from '../../styles/ModalUsarPlaca.module.css';
import { MdOutlineClose } from "react-icons/md";

export default function ModalUsarPlaca({ placa, onConfirm, onClose }) {
  const [quantidadeUsar, setQuantidadeUsar] = useState(1);

  const handleConfirm = () => {
    if (quantidadeUsar <= 0) return alert("Quantidade inválida");
    onConfirm(placa, quantidadeUsar);
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
          <input
            type="number"
            min="1"
            max={placa.quantidade}
            value={quantidadeUsar}
            onChange={e => setQuantidadeUsar(Number(e.target.value))}
          />

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
