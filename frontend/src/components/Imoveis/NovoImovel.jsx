import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NovoImovel({ onClose, onSuccess, onExcluir }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('cadastrar');
  const [ordem, setOrdem] = useState(0); // Estado para a ordem
  const [imagem, setImagem] = useState(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(''); // Para mensagens de erro

  // Função para buscar o último imóvel e pegar a ordem
  const getUltimoImovel = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/imoveis/ultimo');
      if (res.data && res.data.ordem !== undefined) {
        setOrdem(res.data.ordem + 1); // Define a ordem como o próximo número
      }
    } catch (err) {
      console.error('Erro ao buscar o último imóvel', err);
      setOrdem(0); // Se não encontrar nenhum imóvel, começa do zero
    }
  };

  // Chama a função para buscar o último imóvel assim que o componente for montado
  useEffect(() => {
    getUltimoImovel();
  }, []);

  const handleSubmit = async () => {
    setError(''); // Limpa os erros antes de tentar enviar

    try {
      if (!titulo.trim()) {
        return setError('Preencha o título do imóvel!');
      }

      // Cadastra o imóvel
      const res = await axios.post('http://localhost:5000/api/imoveis', {
        titulo,
        descricao,
        status,
        ordem, // Passando a ordem
      });
      console.log(res.data); // Verifique o que está sendo retornado da API

      const novoImovel = res.data;

      // Envia imagem se houver
      if (imagem) {
        const formDataImg = new FormData();
        formDataImg.append('file', imagem);
        await axios.post(
          `http://localhost:5000/api/upload/${novoImovel._id}/imagens`,
          formDataImg,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      }

      // Envia vídeo se houver
      if (video) {
        const formDataVid = new FormData();
        formDataVid.append('file', video);
        await axios.post(
          `http://localhost:5000/api/upload/${novoImovel._id}/videos`,
          formDataVid,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      }

      alert('Imóvel cadastrado com sucesso!');
      onSuccess(); // Atualiza a lista de imóveis ou fecha modal

    } catch (err) {
      console.error(err);
      setError('Erro ao cadastrar imóvel.');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Novo Imóvel</h2>

        {error && <div className="error-message">{error}</div>}

        <label>Título</label>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />

        <label>Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="cadastrar">Cadastrar</option>
          <option value="fazer tour 360º">Fazer tour 360º</option>
          <option value="fazer video">Fazer vídeo</option>
          <option value="concluído">Concluído</option>
        </select>

        <label>Imagem</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagem(e.target.files[0])}
        />

        <label>Vídeo</label>
        <input
          type="file"
          accept="video/mp4"
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <button onClick={handleSubmit}>Cadastrar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
