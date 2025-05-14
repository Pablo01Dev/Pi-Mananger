import { useEffect, useState } from 'react';
import axios from 'axios';
import NovoImovel from '../components/Imoveis/NovoImovel';
import ListaCards from '../components/Imoveis/ListaCards';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [imoveis, setImoveis] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('cadastrar');

  const carregarImoveis = () => {
    axios.get('http://localhost:5000/api/imoveis')
      .then(response => {
        console.log('Imóveis carregados:', response.data);
        setImoveis(response.data);
      })
      .catch(error => console.error('Erro ao buscar imóveis:', error));
  };

  useEffect(() => {
    carregarImoveis();
  }, []);

  const imoveisFiltrados = imoveis.filter(imovel =>
    imovel.status.toLowerCase() === abaSelecionada.toLowerCase()
  );

  console.log('Imóveis filtrados:', imoveisFiltrados);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const filtrados = imoveis.filter(imovel =>
      imovel.status.toLowerCase() === abaSelecionada.toLowerCase()
    );

    const outros = imoveis.filter(imovel =>
      imovel.status.toLowerCase() !== abaSelecionada.toLowerCase()
    );

    const reordered = Array.from(filtrados);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    reordered.forEach((imovel, index) => {
      imovel.ordem = index;
    });

    const novaLista = [...outros, ...reordered];

    setImoveis(novaLista);

    axios.put('http://localhost:5000/api/imoveis/ordem', novaLista)
      .then(response => {
        console.log('Ordem atualizada com sucesso no back-end!');
      })
      .catch(error => {
        console.error('Erro ao atualizar a ordem:', error);
      });
  };

  const handleExcluirImovel = async (imovelId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/imoveis/${imovelId}`);

      if (response.status === 200) {
        // REMOVA O ALERTA DAQUI
        setImoveis(imoveis.filter(imovel => imovel._id !== imovelId));
        setMostrarModal(false);
      }
    } catch (err) {
      console.error('Erro ao excluir imóvel:', err);
      alert('Erro ao excluir imóvel.');
    }
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
          <button className={styles.novoButton} type="button" onClick={() => setMostrarModal(true)}>
            <h4 className={styles.novo}>Novo Imóvel</h4>
            <p className={styles.mais}>+</p>
          </button>
        </div>

      </div>
      <ListaCards imoveisFiltrados={imoveisFiltrados} handleDragEnd={handleDragEnd} onExcluir={handleExcluirImovel} />

      {mostrarModal && (
        <NovoImovel
          onClose={() => setMostrarModal(false)}
          onCriar={() => {
            setMostrarModal(false);
            carregarImoveis(); // Refatorado para carregar imóveis após a criação
          }}
          onExcluir={handleExcluirImovel}
        />
      )}
    </div>
  );
}
