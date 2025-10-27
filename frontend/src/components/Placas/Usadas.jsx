import { useEffect, useState } from 'react';
import axios from 'axios';
import CardPlaca from './CardPlaca';
import styles from '../../styles/Produzir.module.css';

const categorias = ['Alugue', 'Compre', 'Compre e Alugue', 'Outros'];

// 🔧 URL dinâmica: local → localhost, produção → Render
const API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/placas`
    : 'http://localhost:5000/api/placas';

export default function Usadas() {
  const [placas, setPlacas] = useState([]);

  useEffect(() => {
    async function fetchPlacas() {
      try {
        const res = await axios.get(API_URL);
        setPlacas(res.data);
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      }
    }
    fetchPlacas();
  }, []);

  const handleUsar = async (id) => {
    try {
      await axios.put(`${API_URL}/usar/${id}`);
      setPlacas((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: 'usado' } : p))
      );
    } catch (error) {
      console.error('Erro ao usar a placa:', error);
      alert('Falha ao usar a placa.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setPlacas((prev) => prev.filter((p) => p._id !== id));
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
            (p) => p.tipo === categoria && p.status === 'usado'
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
