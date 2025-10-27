import { useEffect, useState } from 'react';
import api from '../../api'; // ✅ usa instância centralizada
import CardPlaca from './CardPlaca';
import styles from '../../styles/Produzir.module.css';

const categorias = ['Alugue', 'Compre', 'Compre e Alugue', 'Outros'];

export default function Disponiveis() {
  const [placas, setPlacas] = useState([]);

  useEffect(() => {
    async function fetchPlacas() {
      try {
        const res = await api.get('/placas'); // ✅ troca localhost pela instância
        setPlacas(res.data);
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      }
    }
    fetchPlacas();
  }, []);

  const handleUsar = async (placa) => {
    try {
      const res = await api.put(`/placas/status/${placa._id}`, { status: 'usado' }); // ✅ troca localhost
      setPlacas(prev =>
        prev.map(p => (p._id === placa._id ? res.data : p))
      );
    } catch (error) {
      console.error('Erro ao usar a placa:', error);
      alert('Falha ao usar a placa.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/placas/${id}`); // ✅ troca localhost
      setPlacas(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Erro ao deletar a placa:', error);
      alert('Falha ao deletar a placa.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gridCategorias}>
        {categorias.map((categoria) => {
          const placasFiltradas = placas.filter(
            (p) => p.tipo === categoria && p.status === 'pago'
          );

          return (
            <div key={categoria} className={styles.colunaCategoria}>
              <div className={styles.categoria}>{categoria}</div>

              <div className={styles.cards}>
                {placasFiltradas.length > 0 ? (
                  placasFiltradas.map((placa) => (
                    <CardPlaca
                      key={placa._id}
                      placa={placa}
                      botaoLabel="Usar"
                      onBotaoClick={handleUsar}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <p className={styles.semPlacas}>—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
