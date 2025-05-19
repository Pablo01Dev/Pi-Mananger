import styles from '../../styles/CardPlaca.module.css';

export default function CardPlaca({ placa, onEnviar, onDelete }) {
  const handleEnviar = async () => {
    try {
      await onEnviar(placa._id);
    } catch (error) {
      console.error('Erro ao enviar a placa:', error);
      alert('Erro ao enviar a placa. Tente novamente.');
    }
  };

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
      <div>
        <h1>{placa.titulo}</h1>
        <h3>Largura: {placa.largura}m</h3>
        <h3>Altura: {placa.altura}m</h3>
        <h3>Material: {placa.material}</h3>
        {placa.observacao && <h4>Obs: {placa.observacao}</h4>}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={handleEnviar} aria-label="Enviar placa">
          Enviar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className={styles.delete}
          aria-label="Excluir placa"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
