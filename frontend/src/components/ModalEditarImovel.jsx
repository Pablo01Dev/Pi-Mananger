// components/ModalEditarImovel.jsx
import { useState } from 'react';
import axios from 'axios';
import '../styles/ModalEditarImovel.css';


export default function ModalEditarImovel({ imovel, onClose, onAtualizar }) {
    const [titulo, setTitulo] = useState(imovel.titulo);
    const [descricao, setDescricao] = useState(imovel.descricao);
    const [status, setStatus] = useState(imovel.status);
    const [arquivo, setArquivo] = useState(null);
    const [video, setVideo] = useState(null);
    const [showCarousel, setShowCarousel] = useState(false);

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/imoveis/${imovel._id}`, {
                titulo,
                descricao,
                status,
            });

            if (arquivo) {
                const formDataImg = new FormData();
                formDataImg.append('file', arquivo);
                await axios.post(
                    `http://localhost:5000/api/uploadArquivo/${imovel._id}/imagens`,
                    formDataImg,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            if (video) {
                const formDataVid = new FormData();
                formDataVid.append('file', video);
                await axios.post(
                    `http://localhost:5000/api/uploadArquivo/${imovel._id}/videos`,
                    formDataVid,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            alert('Atualização concluída!');
            onClose();
            if (onAtualizar) onAtualizar();
        } catch (err) {
            console.error('Erro ao atualizar imóvel:', err.response ? err.response.data : err.message);
            alert('Erro ao atualizar imóvel.');
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Editar Imóvel</h2>

                <label>Título</label>
                <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} />

                <label>Descrição</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} />

                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="cadastrar">Cadastrar</option>
                    <option value="fazer video">Fazer Vídeo</option>
                    <option value="fazer tour 360º">Fazer Tour 360º</option>
                    <option value="concluído">Concluído</option>
                </select>

                <label>Imagem principal</label>
                {imovel.imagens?.length > 0 && (
                    <img
                        src={`http://localhost:5000/${imovel.imagens[0].path.replace(/\\/g, '/')}`}
                        alt="Imagem principal"
                        className="imagem-preview"
                        onClick={() => setShowCarousel(true)}
                    />
                )}
                <input type="file" onChange={e => setArquivo(e.target.files[0])} />

                <label>Vídeo</label>
                {imovel.video?.link && (
                    <video controls width="250">
                        <source src={imovel.video.link} type="video/mp4" />
                    </video>
                )}
                <input type="file" accept="video/mp4" onChange={e => setVideo(e.target.files[0])} />

                <button onClick={handleUpdate}>Salvar alterações</button>
                <button onClick={onClose}>Cancelar</button>
            </div>

            {showCarousel && (
                <div className="carrossel-overlay">
                    <div className="carrossel">
                        {imovel.imagens.map((img, idx) => (
                            <img key={idx} src={`http://localhost:5000/${img.path.replace(/\\/g, '/')}`} alt={`Imagem ${idx}`} />
                        ))}
                        <button onClick={() => setShowCarousel(false)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
