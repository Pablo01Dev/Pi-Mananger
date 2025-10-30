import { useState } from 'react';
import styles from '../../styles/CardPlaca.module.css';
import { MdDelete } from "react-icons/md";

export default function CardPlaca({ placa, botaoLabel, onBotaoClick, onDelete }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [quantidadeExcluir, setQuantidadeExcluir] = useState(1);

  // 🟢 Função chamada quando o botão "Enviar" é clicado
  const handleBotaoClick = async () => {
    if (onBotaoClick) {
      try {
        await onBotaoClick(placa);
      } catch (error) {
        console.error(`Erro ao executar ação "${botaoLabel}" na placa:`, error);
        alert(`Erro ao executar a ação "${botaoLabel}". Tente novamente.`);
      }
    }
  };

  // 🔴 Abre o modal ao clicar na lixeira
  const handleDelete = () => {
    setMostrarModal(true);
    setQuantidadeExcluir(1);
  };

  // ⚙️ Confirma a exclusão
  const confirmarDelete = async () => {
    try {
      if (!onDelete) return;

      const qtd = Number(quantidadeExcluir);
      if (qtd <= 0 || qtd > placa.quantidade) {
        alert('Quantidade inválida.');
        return;
      }

      // Envia o id e a quantidade para o pai
      await onDelete(placa._id, qtd);
      setMostrarModal(false);
    } catch (error) {
      console.error('Erro ao deletar a placa:', error);
      alert('Erro ao deletar a placa. Tente novamente.');
    }
  };

  return (
    <div className={styles.cardPlaca}>
      {/* Ícone de exclusão */}
      {onDelete && (
        <div className={styles.delete}>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Excluir placa"
          >
            <MdDelete />
          </button>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className={styles.content}>
        <h1>{placa.titulo}</h1>
        <h3>Largura: {placa.largura}m</h3>
        <h3>Altura: {placa.altura}m</h3>
        <h3>Material: {placa.material}</h3>
        <h3>Quantidade: {placa.quantidade}</h3>
        {placa.observacao && <h4>Obs: {placa.observacao}</h4>}
      </div>

      {/* Botão de ação principal */}
      <div className={styles.actions}>
        {botaoLabel && onBotaoClick && (
          <button
            className={styles.botaoEnviar}
            type="button"
            onClick={handleBotaoClick}
            aria-label={botaoLabel}
          >
            {botaoLabel}
          </button>
        )}
      </div>

      {/* Modal de exclusão */}
      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Excluir placa</h3>
            <p><strong>{placa.titulo}</strong></p>
            <p>Quantidade disponível: {placa.quantidade}</p>

            <label>
              Quantidade a excluir:
              <input
                type="number"
                min="1"
                max={placa.quantidade}
                value={quantidadeExcluir}
                onChange={(e) => setQuantidadeExcluir(e.target.value)}
              />
            </label>

            <div className={styles.modalButtons}>
              <button onClick={confirmarDelete}>Confirmar</button>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
