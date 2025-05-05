import { useState } from 'react';
import axios from 'axios';
import '../styles/NovoImovel.css'; // se quiser separar o estilo

export default function NovoImovel() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('disponivel');
  const [arquivo, setArquivo] = useState(null);
  const [video, setVideo] = useState(null); // Novo estado para o vídeo

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Cria o imóvel no banco
      const response = await axios.post('http://localhost:5000/api/imoveis', {
        titulo,
        descricao,
        status
      });

      const imovelId = response.data._id;

      // 2. Envia imagem, se houver
      if (arquivo) {
        const formData = new FormData();
        formData.append('arquivo', arquivo);

        await axios.post(`http://localhost:5000/api/upload/${imovelId}/imagens`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Envia vídeo, se houver
      if (video) {
        const formDataVideo = new FormData();
        formDataVideo.append('arquivo', video);

        await axios.post(`http://localhost:5000/api/upload/${imovelId}/videos`, formDataVideo, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('Imóvel cadastrado com sucesso!');
      // limpa campos
      setTitulo('');
      setDescricao('');
      setStatus('disponivel');
      setArquivo(null);
      setVideo(null);

    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar imóvel.');
    }
  };

  return (
    <div className="form-container">
      <h2>Novo Imóvel</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="disponivel">Disponível</option>
          <option value="em andamento">Em Andamento</option>
          <option value="vendido">Vendido</option>
        </select>
        <input
          type="file"
          onChange={(e) => setArquivo(e.target.files[0])}
        />
        {/* Campo de vídeo */}
        <input
          type="file"
          accept="video/mp4"
          onChange={(e) => setVideo(e.target.files[0])}
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
