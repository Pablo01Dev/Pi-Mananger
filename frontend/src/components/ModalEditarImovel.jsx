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
    const [imagens, setImagens] = useState(imovel.imagens || []);

    const handleUpdate = async () => {
        try {
            // Atualiza as informações principais do imóvel
            await axios.put(`http://localhost:5000/api/imoveis/${imovel._id}`, {
                titulo,
                descricao,
                status,
            });

            // Verifica e envia o arquivo de imagem, se houver
            if (arquivo) {
                const formDataImg = new FormData();
                formDataImg.append('arquivo', arquivo);
                const response = await axios.post(
                    `http://localhost:5000/api/upload/${imovel._id}/imagens`,
                    formDataImg,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setImagens(response.data.imagens); // Atualiza após upload
            }

            // Verifica e envia o arquivo de vídeo, se houver
            if (video) {
                const formDataVid = new FormData();
                formDataVid.append('arquivo', video);
                await axios.post(
                    `http://localhost:5000/api/upload/${imovel._id}/videos`,
                    formDataVid,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            // ✅ Aqui está a parte que deve sempre rodar, independente de vídeo
            for (const filename of imagensParaExcluir) {
                try {
                    await axios.delete(`http://localhost:5000/api/upload/${imovel._id}/${filename}`);
                } catch (err) {
                    console.error(`Erro ao excluir ${filename}:`, err.response?.data || err.message);
                }
            }

            alert('Atualização concluída!');
            onClose();
            if (onAtualizar) onAtualizar();  // Atualiza a lista de imóveis após sucesso
        } catch (err) {
            console.error('Erro ao atualizar imóvel:', err.response ? err.response.data : err.message);
            alert('Erro ao atualizar imóvel.');
        }
    };


    const handleDeleteImage = (filename) => {
        setImagensParaExcluir((prev) => [...prev, filename]);
        setImagens((prev) => prev.filter(img => img.filename !== filename));
    };


    const [imagensParaExcluir, setImagensParaExcluir] = useState([]);


    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-button" onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}>
                    Fechar
                </button>
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

                <label>Imagens</label>
                {imagens?.length > 0 && (
                    <img
                        src={`http://localhost:5000/${imagens[0].path.replace(/\\/g, '/')}`}
                        alt="Imagem principal"
                        className="imagem-preview"
                        onClick={() => setShowCarousel(true)}
                    />
                )}

                <input
                    type="file"
                    id="inputImagem"
                    className="input-arquivo"
                    onChange={e => setArquivo(e.target.files[0])}
                />

                <label htmlFor="inputImagem" className="botao-upload">
                    Adicionar imagem
                </label>

                <label>Vídeos</label>
                {imovel.video?.link && (
                    <video controls width="250">
                        <source src={imovel.video.link} type="video/mp4" />
                    </video>
                )}
                <input
                    type="file"
                    accept="video/mp4"
                    id="inputVideo"
                    style={{ display: 'none' }}
                    onChange={e => setVideo(e.target.files[0])}
                />

                <label htmlFor="inputVideo" className="botao-upload">
                    Adicionar vídeo
                </label>

                <button className='save-button' onClick={handleUpdate}>Salvar alterações</button>
            </div>

            {showCarousel && (
                <div className="carrossel-overlay">
                    <div className="carrossel">
                        {imagens.map((img, idx) => (
                            <div key={idx} className="carrossel-item">
                                <img src={`http://localhost:5000/${img.path.replace(/\\/g, '/')}`} alt={`Imagem ${idx}`} />
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteImage(img.filename)}
                                >
                                    Excluir
                                </button>
                            </div>
                        ))}
                        <button className='carousel-close-button' onClick={() => setShowCarousel(false)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
