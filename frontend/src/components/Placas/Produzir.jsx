import { useEffect, useState } from 'react';
import axios from 'axios';
import CardPlaca from './CardPlaca';
import styles from '../../styles/Produzir.module.css';

const categorias = ['Alugue', 'Compre', 'Compre e Alugue', 'Outros'];

export default function Produzir() {
  const [placas, setPlacas] = useState([]);

  useEffect(() => {
    async function fetchPlacas() {
      try {
        const res = await axios.get('http://localhost:5000/api/placas');
        setPlacas(res.data);
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      }
    }
    fetchPlacas();
  }, []);

  const handleEnviar = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/placas/enviar/${id}`);
      setPlacas(prev =>
        prev.map(p => p._id === id ? { ...p, status: 'pagar' } : p)
      );
    } catch (error) {
      console.error('Erro ao enviar a placa:', error);
      alert('Falha ao enviar a placa.');
    }
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

  return (
    <div className={styles.container}>
      <div className={styles.gridCategorias}>
        {categorias.map(categoria => {
          const placasFiltradas = placas.filter(
            p => p.tipo === categoria && p.status === 'produzir'
          );

          return (
            <div key={categoria} className={styles.colunaCategoria}>
              <button className={styles.botaoCategoria} disabled>
                {categoria}
              </button>
              <div className={styles.cards}>
                {placasFiltradas.length > 0 ? (
                  placasFiltradas.map(placa => (
                    <CardPlaca
                      key={placa._id}
                      placa={placa}
                      onEnviar={handleEnviar}
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
