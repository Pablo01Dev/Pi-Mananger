import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ListaImoveis.css'; // Crie esse CSS se quiser estilizar

export default function ListaImoveis() {
  const [imoveis, setImoveis] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/imoveis') // ajuste se sua URL for diferente
      .then(response => {
        setImoveis(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar imóveis:', error);
      });
  }, []);

  return (
    <div className="lista-imoveis">
      <h2>Imóveis Cadastrados</h2>
      {imoveis.length === 0 ? (
        <p>Nenhum imóvel cadastrado ainda.</p>
      ) : (
        <ul>
          {imoveis.map(imovel => (
            <li key={imovel._id}>
              <h3>{imovel.titulo}</h3>
              <p>{imovel.descricao}</p>
              <p>Status: {imovel.status}</p>
              {imovel.imagens && imovel.imagens.length > 0 && (
                <div className="imagens">
                  {imovel.imagens.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:3000/${img.path.replace(/\\/g, '/')}`}
                      alt={img.filename}
                      style={{ width: '150px', marginRight: '10px' }}
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
