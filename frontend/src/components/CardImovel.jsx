import { useState } from 'react';
import axios from 'axios';
import '../styles/CardImovel.css';

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'cadastrar':
            return 'red';
        case 'editar video':
            return 'blue';
        case 'fazer tour 360º':
            return 'yellow';
        default:
            return 'black';
    }
};


export default function CardImovel({ imovel }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [titulo, setTitulo] = useState(imovel.titulo);
    const [descricao, setDescricao] = useState(imovel.descricao);
    const [status, setStatus] = useState(imovel.status);
    const [arquivo, setArquivo] = useState(null);
    const [video, setVideo] = useState(null);
    const [showCarousel, setShowCarousel] = useState(false);

    const handleUpdate = async () => {
        try {
            // Atualiza título e descrição
            await axios.put(`http://localhost:5000/api/imoveis/${imovel._id}`, {
                titulo,
                descricao
            });

            // Se tiver imagem nova
            if (arquivo) {
                const formDataImg = new FormData();
                formDataImg.append('file', arquivo);

                await axios.post(
                    `http://localhost:5000/api/uploadArquivo/${imovel._id}/imagens`,
                    formDataImg,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            // Se tiver vídeo novo
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
            setIsModalOpen(false);
            if (onAtualizar) onAtualizar();

        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar imóvel.');
        }
    };


    return (
        <div className="card-imovel">
            <div className="status-bar">
                <p>{imovel.status}</p>
                <div
                    className="status-color"
                    style={{ backgroundColor: getStatusColor(status) }}
                />
            </div>


            <h3>{imovel.titulo}</h3>
            <p>{imovel.descricao}</p>


            <div className="media">
                {imovel.imagens?.map((img, idx) => (
                    <img
                        key={idx}
                        src={`http://localhost:5000/${img.path.replace(/\\/g, '/')}`}
                        alt={img.filename}
                        width="100"
                    />
                ))}
                {imovel.videos?.map((vid, idx) => (
                    <video key={idx} width="150" controls>
                        <source src={`http://localhost:5000/${vid.path.replace(/\\/g, '/')}`} type="video/mp4" />
                        Seu navegador não suporta vídeo.
                    </video>
                ))}
            </div>

            <button onClick={() => setIsModalOpen(true)}>Editar</button>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Editar Imóvel</h2>

                        <label>Título</label>
                        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} />

                        <label>Descrição</label>
                        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} />

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
                        <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    </div>

                    {showCarousel && (
                        <div className="carrossel-overlay">
                            <div className="carrossel">
                                {imovel.imagens.map((img, idx) => (
                                    <img key={idx} src={img} alt={`Imagem ${idx}`} />
                                ))}
                                <button onClick={() => setShowCarousel(false)}>Fechar</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
