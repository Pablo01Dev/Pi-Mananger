import { useState } from 'react';
import ModalEditarImovel from './ModalEditarImovel';
import '../styles/CardImovel.css';

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'cadastrar':
            return '#DD2257';
        case 'fazer video':
            return '#1E90FF';
        case 'fazer tour 360º':
            return '#FF9D00';
        case 'concluído':
            return '#54D763';
        default:
            return 'black';
    }
};

export default function CardImovel({ imovel, onAtualizar }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="card-imovel">
            <div className="status-bar">
                <p>{imovel.status}</p>
                <div
                    className="status-color"
                    style={{ backgroundColor: getStatusColor(imovel.status) }}
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
                <ModalEditarImovel
                    imovel={imovel}
                    onClose={() => setIsModalOpen(false)}
                    onAtualizar={onAtualizar}
                />
            )}
        </div>
    );
}
