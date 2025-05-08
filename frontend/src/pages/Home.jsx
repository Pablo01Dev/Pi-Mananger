import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Home.css';
import CardImovel from '../components/CardImovel';
import NovoImovel from '../components/NovoImovel';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ListaCards from '../components/ListaCards';

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

    // Filtra os imóveis da aba atual
    const filtrados = imoveis.filter(imovel =>
      imovel.status.toLowerCase() === abaSelecionada.toLowerCase()
    );

    const outros = imoveis.filter(imovel =>
      imovel.status.toLowerCase() !== abaSelecionada.toLowerCase()
    );

    // Reordena a lista da aba atual
    const reordered = Array.from(filtrados);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Atualiza a propriedade 'ordem' para todos os imóveis da lista reordenada
    reordered.forEach((imovel, index) => {
      imovel.ordem = index; // A propriedade ordem é definida conforme a nova posição
    });

    // Junta os imóveis reordenados com os que não foram afetados
    const novaLista = [...outros, ...reordered];

    // Atualiza o estado no front-end
    setImoveis(novaLista);

    // Envia a nova ordem para o back-end
    axios.put('http://localhost:5000/api/imoveis/ordem', novaLista)
      .then(response => {
        console.log('Ordem atualizada com sucesso no back-end!');
      })
      .catch(error => {
        console.error('Erro ao atualizar a ordem:', error);
      });
  };


  return (
    <div className="home-container">
      <div className="home-nav">
        <ul>
          <li
            className={abaSelecionada === 'cadastrar' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('cadastrar')}
          >
            Cadastrar
          </li>
          <li
            className={abaSelecionada === 'fazer video' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('fazer video')}
          >
            Vídeo
          </li>
          <li
            className={abaSelecionada === 'fazer tour 360º' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('fazer tour 360º')}
          >
            Tour 360º
          </li>
          <li
            className={abaSelecionada === 'concluído' ? 'ativo' : ''}
            onClick={() => setAbaSelecionada('concluído')}
          >
            Concluído
          </li>
        </ul>

        <button className='novo-button' type="button" onClick={() => setMostrarModal(true)}>
          <h4 className='novo'>Novo Imóvel</h4> 
          <p className='mais'>+</p>
        </button>
      </div>
      <ListaCards imoveisFiltrados={imoveisFiltrados} handleDragEnd={handleDragEnd} />

      {mostrarModal && (
        <NovoImovel
          onClose={() => setMostrarModal(false)}
          onSuccess={() => {
            setMostrarModal(false);
            carregarImoveis();
          }}
        />
      )}
    </div>
  );
}