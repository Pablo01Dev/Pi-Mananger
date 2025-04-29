import React, { useState } from 'react';
import axios from 'axios';

const UploadImagensVideos = ({ imovelId }) => {
  const [tipo, setTipo] = useState('imagens'); // imagens, videos, documentos
  const [arquivo, setArquivo] = useState(null);

  const handleUpload = async () => {
    if (!arquivo) return alert("Selecione um arquivo");

    const formData = new FormData();
    formData.append('arquivo', arquivo);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/imoveis/${imovelId}/upload?tipo=${tipo}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert('Upload realizado com sucesso!');
      console.log(response.data);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar arquivo');
    }
  };

  return (
    <div>
      <h3>Upload de Arquivo</h3>

      <select value={tipo} onChange={e => setTipo(e.target.value)}>
        <option value="imagens">Imagem</option>
        <option value="videos">Vídeo</option>
        <option value="documentos">Documento</option>
      </select>

      <input type="file" onChange={e => setArquivo(e.target.files[0])} />
      <button onClick={handleUpload}>Enviar</button>
    </div>
  );
};

export default UploadImagensVideos;
