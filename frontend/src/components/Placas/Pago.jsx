import { useEffect, useState } from 'react';
import styles from '../../styles/Pagar.module.css';

export default function Pagar() {
  const [placas, setPlacas] = useState([]);

  useEffect(() => {
    // Supondo que a API seja algo como /api/placas
    fetch('/api/placas')
      .then(res => res.json())
      .then(data => {
        const filtrarPagamentos = data.filter(p => p.status === 'pagar');
        setPlacas(filtrarPagamentos);
      });
  }, []);

  return (
    <div className={styles.pagarContainer}>
      <div className={styles.header}>
        <h2>Pagamento pendente</h2>
        <button className={styles.botaoPago}>Pago</button>
      </div>

      {placas.map((placa) => (
        <div key={placa.id} className={styles.card}>
          <div className={styles.linha}>
            <span><strong>Data de envio:</strong> {placa.dataEnvio}</span>
            <span><strong>Título:</strong> {placa.titulo}</span>
            <span><strong>Conteúdo:</strong> {placa.conteudo}</span>
            <span><strong>Altura:</strong> {placa.altura}</span>
            <span><strong>Largura:</strong> {placa.largura}</span>
            <span><strong>Material:</strong> {placa.material}</span>
            <span><strong>Valor:</strong> R${placa.valor.toFixed(2)}</span>
            <input type="checkbox" />
          </div>
          {placa.observacao && (
            <p className={styles.observacao}>Obs: {placa.observacao}</p>
          )}
        </div>
      ))}
    </div>
  );
}
