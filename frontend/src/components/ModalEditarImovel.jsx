import { useState } from 'react';
import axios from 'axios';
import '../styles/ModalEditarImovel.css';

export default function ModalEditarImovel({ imovel, onClose, onAtualizar }) {
    const [titulo, setTitulo] = useState(imovel.titulo);
    const [descricao, setDescricao] = useState(imovel.descricao);
    const [status, setStatus] = useState(imovel.status);
    const [arquivos, setArquivos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [showCarousel, setShowCarousel] = useState(false);
    const [imagens, setImagens] = useState(imovel.imagens || []);

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/imoveis/${imovel._id}`, {
                titulo,
                descricao,
                status,
            });

            // Upload múltiplas imagens
            for (const img of arquivos) {
                const formDataImg = new FormData();
                formDataImg.append('arquivo', img);
                const response = await axios.post(
                    `http://localhost:5000/api/upload/${imovel._id}/imagens`,
                    formDataImg,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setImagens(prev => [...prev, ...response.data.imagens]);
            }

            // Upload múltiplos vídeos
            for (const vid of videos) {
                const formDataVid = new FormData();
                formDataVid.append('arquivo', vid);
                await axios.post(
                    `http://localhost:5000/api/upload/${imovel._id}/videos`,
                    formDataVid,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            // Exclusão de imagens
            for (const filename of imagensParaExcluir) {
                try {
                    await axios.delete(`http://localhost:5000/api/upload/${imovel._id}/${filename}`);
                } catch (err) {
                    console.error(`Erro ao excluir ${filename}:`, err.response?.data || err.message);
                }
            }

            alert('Atualização concluída!');
            onClose();
            if (onAtualizar) onAtualizar();
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
                    multiple
                    accept="image/*"
                    onChange={e => setArquivos(Array.from(e.target.files))}
                />
                
                {arquivos.length > 0 && (
                    <div className="preview-container">
                        {arquivos.map((file, index) => (
                            <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                className="imagem-preview"
                            />
                        ))}
                    </div>
                )}


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
                    id="inputVideo"
                    style={{ display: 'none' }}
                    multiple
                    accept="video/mp4"
                    onChange={e => setVideos(Array.from(e.target.files))}
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
