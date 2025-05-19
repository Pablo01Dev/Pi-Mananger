// src/components/Pagar.jsx
import styles from '../styles/Pagar.module.css';

const placas = [
  {
    id: 1,
    dataEnvio: '21/05/2024 - 14:30h',
    titulo: 'Galpão Venda das Pedras',
    conteudo: 'Alugue',
    altura: '100cm',
    largura: '200cm',
    material: 'Lona',
    valor: 'R$480,00',
    observacao: '',
  },
  {
    id: 2,
    dataEnvio: '21/05/2024 - 14:30h',
    titulo: 'Casa Vital Brasil',
    conteudo: 'Alugue',
    altura: '100cm',
    largura: '200cm',
    material: 'Lona',
    valor: 'R$480,00',
    observacao: 'Parceria com Fernando Cabral',
  },
];

export default function Pagar() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Pagamento pendente</h2>
      </div>

      {placas.map((placa) => (
        <div key={placa.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span><strong>Data de envio:</strong> {placa.dataEnvio}</span>
            <span><strong>Título:</strong> {placa.titulo}</span>
          </div>
          <div className={styles.cardBody}>
            <span><strong>Conteúdo:</strong> {placa.conteudo}</span>
            <span><strong>Altura:</strong> {placa.altura}</span>
            <span><strong>Largura:</strong> {placa.largura}</span>
            <span><strong>Material:</strong> {placa.material}</span>
            <span><strong>Valor:</strong> {placa.valor}</span>
            <input type="checkbox" />
          </div>
          {placa.observacao && (
            <div className={styles.cardFooter}>
              <small>Obs: {placa.observacao}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
