import { useState } from 'react';
import axios from 'axios';
import '../styles/NovoImovel.css';

export default function NovoImovel({ onClose, onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('cadastrar');
  const [imagem, setImagem] = useState(null);
  const [video, setVideo] = useState(null);

  const handleSubmit = async () => {
    try {
      // 1. Cadastra imóvel
      const res = await axios.post('http://localhost:5000/api/imoveis', {
        titulo,
        descricao,
        status,
      });

      const novoImovel = res.data;

      // 2. Envia imagem se houver
      if (imagem) {
        const formDataImg = new FormData();
        formDataImg.append('file', imagem);
        await axios.post(
          `http://localhost:5000/api/uploadArquivo/${novoImovel._id}/imagens`,
          formDataImg,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // 3. Envia vídeo se houver
      if (video) {
        const formDataVid = new FormData();
        formDataVid.append('file', video);
        await axios.post(
          `http://localhost:5000/api/uploadArquivo/${novoImovel._id}/videos`,
          formDataVid,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      alert('Imóvel cadastrado com sucesso!');
      onSuccess(); // fecha e atualiza
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar imóvel.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Novo Imóvel</h2>

        <label>Título</label>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />

        <label>Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="cadastrar">Cadastrar</option>
          <option value="editar video">Editar vídeo</option>
          <option value="tour 360">Tour 360</option>
          <option value="concluído">Concluído</option>
        </select>

        <label>Imagem</label>
        <input type="file" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} />

        <label>Vídeo</label>
        <input type="file" accept="video/mp4" onChange={(e) => setVideo(e.target.files[0])} />

        <button onClick={handleSubmit}>Cadastrar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
