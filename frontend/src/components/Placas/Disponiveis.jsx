import { useEffect, useState } from 'react';
import api from '../../api';
import CardPlaca from './CardPlaca';
import ModalUsarPlaca from './ModalUsarPlaca';
import styles from '../../styles/Produzir.module.css';

const categorias = ['Alugue', 'Compre', 'Compre e Alugue', 'Outros'];

export default function Disponiveis() {
  const [placas, setPlacas] = useState([]);
  const [placaSelecionada, setPlacaSelecionada] = useState(null);

  // 🟡 Carrega placas
  useEffect(() => {
    async function fetchPlacas() {
      try {
        const res = await api.get('/placas');
        setPlacas(res.data);
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      }
    }
    fetchPlacas();
  }, []);

  // 🟢 Abre o modal de uso se tiver mais de 1 unidade
  const handleUsar = (placa) => {
    if (placa.quantidade > 1) {
      setPlacaSelecionada(placa);
    } else {
      confirmarUso(placa, 1);
    }
  };

  // 🟣 Confirma o uso via nova rota /usar/:id
  const confirmarUso = async (placa, qtdUsada) => {
    try {
      const res = await api.put(`/placas/usar/${placa._id}`, {
        quantidadeUsada: qtdUsada
      });

      // Atualiza a lista local
      setPlacas(prev =>
        prev.map(p => (p._id === placa._id ? res.data.placa : p))
      );

      setPlacaSelecionada(null);
    } catch (error) {
      console.error('Erro ao usar placa:', error);
      alert('Falha ao usar placa.');
    }
  };

  // 🔴 Deletar placa
  const handleDelete = async (id) => {
    try {
      await api.delete(`/placas/${id}`);
      setPlacas(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Erro ao deletar a placa:', error);
      alert('Falha ao deletar a placa.');
    }
  };

  // 🧱 Render
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

      {/* Modal de uso */}
      {placaSelecionada && (
        <ModalUsarPlaca
          placa={placaSelecionada}
          onConfirm={confirmarUso}
          onClose={() => setPlacaSelecionada(null)}
        />
      )}
    </div>
  );
}
