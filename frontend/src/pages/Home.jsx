import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Home.css';
import CardImovel from '../components/CardImovel';
import NovoImovel from '../components/NovoImovel';

export default function Home() {
  const [imoveis, setImoveis] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('cadastrar');

  const carregarImoveis = () => {
    axios.get('http://localhost:5000/api/imoveis')
      .then(response => setImoveis(response.data))
      .catch(error => console.error('Erro ao buscar imóveis:', error));
  };

  useEffect(() => {
    carregarImoveis();
  }, []);

  const imoveisFiltrados = imoveis.filter(imovel =>
    imovel.status.toLowerCase() === abaSelecionada.toLowerCase()
  );

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

        <button type="button" onClick={() => setMostrarModal(true)}>
          + Novo Imóvel
        </button>
      </div>

      <div className="lista-cards">
        {imoveisFiltrados.map(imovel => (
          <CardImovel key={imovel._id} imovel={imovel} />
        ))}
      </div>

      {mostrarModal && (
        <NovoImovel
          onClose={() => setMostrarModal(false)}
          onSuccess={() => {
            setMostrarModal(false);
            carregarImoveis(); // Atualiza lista após novo cadastro
          }}
        />
      )}
    </div>
  );
}
