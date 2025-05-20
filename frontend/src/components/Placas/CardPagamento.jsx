import styles from '../../styles/CardPagamento.module.css';

export default function CardPagamento({ placa, selecionado, onSelect }) {
  const handleChange = () => {
    onSelect(placa._id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.linhas}>
        <div className={styles.linha1}>
          <div className={styles.date}><span>Data de envio:</span></div>
          <div className={styles.title}><span>Título:</span></div>
          <div className={styles.content}><span>Conteúdo:</span></div>
          <div className={styles.height}><span>Altura:</span></div>
          <div className={styles.width}><span>Largura:</span></div>
          <div className={styles.material}><span>Material:</span></div>
          <div className={styles.price}><span>Valor:</span></div>
        </div>
        <div className={styles.spacer}> </div>
        <div className={styles.linha2}>
          <div className={styles.date}><span>{new Date(placa.dataEnvio).toLocaleString('pt-BR')}</span></div>
          <div className={styles.title}><span>{placa.titulo}</span></div>
          <div className={styles.content}><span>{placa.tipo}</span></div>
          <div className={styles.height}><span>{placa.altura} cm</span></div>
          <div className={styles.width}><span>{placa.largura} cm</span></div>
          <div className={styles.material}><span>{placa.material}</span></div>
          <div className={styles.price}><span>R$ {Number(placa.valor).toFixed(2)}</span></div>
        </div>

        {placa.observacao && (
          <div className={styles.obs}>
            <div className={styles.spacer}></div>
            <div>Obs: {placa.observacao}</div>
          </div>
        )}
      </div>
      <div className={styles.checkBox}>
        <label>
          <input
            type="checkbox"
            checked={selecionado}
            onChange={handleChange}
          
          />
        </label>
      </div>
    </div>
  );
}
