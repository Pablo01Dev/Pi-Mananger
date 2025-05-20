import styles from '../../styles/CardPlaca.module.css';
import { MdDelete } from "react-icons/md"

export default function CardPlaca({ placa, botaoLabel, onBotaoClick, onDelete }) {
  // Função chamada quando o botão "Enviar" é clicado
  const handleBotaoClick = async () => {
    if (onBotaoClick) {
      try {
        // Chama a função passada pelo componente pai (Produzir)
        // passando o objeto placa inteiro para o cálculo e envio do valor
        await onBotaoClick(placa);
      } catch (error) {
        console.error(`Erro ao executar ação "${botaoLabel}" na placa:`, error);
        alert(`Erro ao executar a ação "${botaoLabel}". Tente novamente.`);
      }
    }
  };

  // Função para deletar a placa com confirmação
  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta placa?')) {
      try {
        await onDelete(placa._id);
      } catch (error) {
        console.error('Erro ao deletar a placa:', error);
        alert('Erro ao deletar a placa. Tente novamente.');
      }
    }
  };

  return (
    <div className={styles.cardPlaca}>
      <div className={styles.delete}>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Excluir placa"
        >
          <MdDelete />
        </button>
      </div>
      <div className={styles.content}>
        <h1>{placa.titulo}</h1>
        <h3>Largura: {placa.largura}m</h3>
        <h3>Altura: {placa.altura}m</h3>
        <h3>Material: {placa.material}</h3>
        {placa.observacao && <h4>Obs: {placa.observacao}</h4>}
      </div>
      <div className={styles.actions}>
        {botaoLabel && onBotaoClick && (
          <button
            className={styles.botaoEnviar}
            type="button"
            onClick={handleBotaoClick} // clique do botão chama a função que chama o pai
            aria-label={botaoLabel}
          >
            {botaoLabel}
          </button>
        )}
      </div>
    </div>
  );
}
