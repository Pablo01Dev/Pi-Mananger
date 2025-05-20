import { useEffect, useState } from 'react';
import axios from 'axios';
import CardPlaca from './CardPagamento';
import styles from '../../styles/Pagar.module.css';

export default function Pagar() {
  const [placas, setPlacas] = useState([]);
  const [selecionadas, setSelecionadas] = useState([]);

  useEffect(() => {
    async function fetchPlacas() {
      try {
        const res = await axios.get('http://localhost:5000/api/placas');
        const placasFiltradas = res.data.filter(
          p => p.status?.toLowerCase() === 'pagar'
        );
        setPlacas(placasFiltradas);
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      }
    }
    fetchPlacas();
  }, []);

  const handleSelecionar = (id) => {
    setSelecionadas(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/placas/${id}`);
      setPlacas(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Erro ao deletar a placa:', error);
      alert('Falha ao deletar a placa.');
    }
  };

  const marcarComoPago = async () => {
    try {
      await Promise.all(
        selecionadas.map(id =>
          axios.put(`http://localhost:5000/api/placas/status/${id}`, {
            status: 'pago'
          })
        )
      );
      // Atualiza o estado para remover as placas pagas da tela
      setPlacas(prev => prev.filter(p => !selecionadas.includes(p._id)));
      setSelecionadas([]);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      alert('Ocorreu um erro ao tentar marcar as placas como pagas.');
    }
  };


  return (

    <div className={styles.pagarContainer}>
      <div className={styles.heroTitle}>
        <h2>Pagamento Pendente</h2>
        <div>
          {selecionadas.length > 0 && (
            <button onClick={marcarComoPago} className={styles.botaoPagar}>
              Pagar ({selecionadas.length})
            </button>
          )}
        </div>
      </div>
      <div className={styles.cards}>
        {placas.length > 0 ? (
          placas.map(placa => (
            <CardPlaca
              key={placa._id}
              placa={placa}
              selecionado={selecionadas.includes(placa._id)}
              onSelect={handleSelecionar}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className={styles.semPlacas}>Nenhuma placa para pagar.</p>
        )}
      </div>
    </div>
  );
}
