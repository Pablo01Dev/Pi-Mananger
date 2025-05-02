import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ListaImoveis.css'; // Crie esse CSS se quiser estilizar

export default function ListaImoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [selectedImoveis, setSelectedImoveis] = useState([]); // Estado para imóveis selecionados

  useEffect(() => {
    axios.get('http://localhost:5000/api/imoveis') // Ajuste a URL se necessário
      .then(response => {
        setImoveis(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar imóveis:', error);
      });
  }, []);

  // Função para lidar com a seleção de imóveis
  const handleSelectImovel = (id) => {
    setSelectedImoveis(prevState => 
      prevState.includes(id) ? prevState.filter(item => item !== id) : [...prevState, id]
    );
  };

  // Função para excluir os imóveis selecionados
  const handleDeleteSelected = () => {
    const imoveisParaExcluir = imoveis.filter(imovel => selectedImoveis.includes(imovel._id));

    // Envia a requisição para excluir os imóveis selecionados
    imoveisParaExcluir.forEach(imovel => {
      axios.delete(`http://localhost:5000/api/imoveis/${imovel._id}`)
        .then(() => {
          setImoveis(prevState => prevState.filter(item => item._id !== imovel._id));
          setSelectedImoveis(prevState => prevState.filter(id => id !== imovel._id));
        })
        .catch(error => {
          console.error('Erro ao excluir imóvel:', error);
        });
    });
  };

  return (
    <div className="lista-imoveis">
      <h2>Imóveis Cadastrados</h2>
      {imoveis.length === 0 ? (
        <p>Nenhum imóvel cadastrado ainda.</p>
      ) : (
        <>
          <button 
            onClick={handleDeleteSelected} 
            disabled={selectedImoveis.length === 0} // Desabilita o botão se nenhum imóvel for selecionado
            className="delete-button"
          >
            Excluir Selecionados
          </button>
          <ul>
            {imoveis.map(imovel => (
              <li key={imovel._id}>
                <input
                  type="checkbox"
                  checked={selectedImoveis.includes(imovel._id)}
                  onChange={() => handleSelectImovel(imovel._id)}
                />
                <h3>{imovel.titulo}</h3>
                <p>{imovel.descricao}</p>
                <p>Status: {imovel.status}</p>
                {imovel.imagens && imovel.imagens.length > 0 && (
                  <div className="imagens">
                    {imovel.imagens.map((img, index) => (
                      <img
                        key={index}
                        src={img?.path ? `http://localhost:5000/${img.path.replace(/\\/g, '/')}` : ''}
                        alt={img.filename}
                        style={{ width: '150px', marginRight: '10px' }}
                      />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
