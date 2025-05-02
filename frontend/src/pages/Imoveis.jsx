// frontend/src/pages/Imoveis.jsx
import { useEffect, useState } from 'react';
import api from '../api';

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([]);

  useEffect(() => {
    async function carregarImoveis() {
      try {
        const res = await api.get('/api/imoveis');
        setImoveis(res.data);
      } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
      }
    }

    carregarImoveis();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Lista de Imóveis</h1>
      <ul>
        {imoveis.map(imovel => (
          <li key={imovel._id}>
            <strong>{imovel.titulo}</strong><br />
            {imovel.descricao}
          </li>
        ))}
      </ul>
    </div>
  );
}
