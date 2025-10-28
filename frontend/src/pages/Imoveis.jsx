import { useEffect, useState } from 'react';
import api from '../api';
import NovoImovel from '../components/Imoveis/NovoImovel';
import ListaCards from '../components/Imoveis/ListaCards';
import styles from '../styles/Imoveis.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('cadastrar');

  // 🔄 Buscar imóveis do servidor
  const carregarImoveis = async () => {
    try {
      const res = await api.get('/imoveis');
      setImoveis(res.data);
    } catch (err) {
      console.error('Erro ao buscar imóveis:', err);
    }
  };

  useEffect(() => {
    carregarImoveis();
  }, []);

  // 📋 Filtra por aba selecionada
  const imoveisFiltrados = imoveis.filter(
    (imovel) => imovel.status?.toLowerCase() === abaSelecionada.toLowerCase()
  );

  // ↕ Reordena imóveis e atualiza no backend
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const filtrados = imoveis.filter(
      (imovel) => imovel.status?.toLowerCase() === abaSelecionada.toLowerCase()
    );

    const outros = imoveis.filter(
      (imovel) => imovel.status?.toLowerCase() !== abaSelecionada.toLowerCase()
    );

    const reordered = Array.from(filtrados);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    reordered.forEach((imovel, index) => {
      imovel.ordem = index;
    });

    const novaLista = [...outros, ...reordered];
    setImoveis(novaLista);

    try {
      await api.put('/imoveis/ordem', novaLista);
      console.log('Ordem atualizada com sucesso no back-end!');
    } catch (err) {
      console.error('Erro ao atualizar a ordem:', err);
    }
  };

  // ❌ Excluir imóvel
  const handleExcluirImovel = async (imovelId) => {
    try {
      const response = await api.delete(`/imoveis/${imovelId}`);
      if (response.status === 200) {
        setImoveis((prev) => prev.filter((i) => i._id !== imovelId));
        setMostrarModal(false);
      }
    } catch (err) {
      console.error('Erro ao excluir imóvel:', err);
      alert('Erro ao excluir imóvel.');
    }
  };

  // ✅ Após criar imóvel → recarrega lista + anima
  const handleCriarImovel = async () => {
    setMostrarModal(false);
    await carregarImoveis(); // 🔁 Recarrega lista do servidor
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeNav}>
        <ul>
          <li
            className={abaSelecionada === 'cadastrar' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('cadastrar')}
          >
            Cadastrar
          </li>
          <li
            className={abaSelecionada === 'fazer tour 360º' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('fazer tour 360º')}
          >
            Tour 360º
          </li>
          <li
            className={abaSelecionada === 'fazer video' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('fazer video')}
          >
            Vídeo
          </li>
          <li
            className={abaSelecionada === 'concluído' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('concluído')}
          >
            Concluído
          </li>
        </ul>

        <div className="div-pai">
          <button
            className={styles.novoButton}
            type="button"
            onClick={() => setMostrarModal(true)}
          >
            <h4 className={styles.novo}>Novo Imóvel</h4>
            <p className={styles.mais}>+</p>
          </button>
        </div>
      </div>

      {/* 💫 Lista animada de imóveis */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={abaSelecionada}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <ListaCards
            imoveisFiltrados={imoveisFiltrados}
            handleDragEnd={handleDragEnd}
            onExcluir={handleExcluirImovel}
            onAtualizar={carregarImoveis}
          />
        </motion.div>
      </AnimatePresence>

      {mostrarModal && (
        <NovoImovel
          onClose={() => setMostrarModal(false)}
          onCriar={handleCriarImovel}
          onExcluir={handleExcluirImovel}
        />
      )}
    </div>
  );
}
