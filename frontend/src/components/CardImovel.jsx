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
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="card-imovel" onClick={() => setIsModalOpen(true)}>
            <div className="status-bar">
                <p>{imovel.status}</p>
                <div
                    className="status-color"
                    style={{ backgroundColor: getStatusColor(imovel.status) }}
                />
            </div>

            <h3>{imovel.titulo}</h3>
            <p className='descript-card'>{imovel.descricao}</p>

            <div className="media">
                {imovel.imagens?.map((img, idx) => (
                    <img
                        key={idx}
                        src={`http://localhost:5000/${img.path.replace(/\\/g, '/')}`}
                        alt={img.filename}
                        className="media-image"
                    />
                ))}
            </div>
            <div className="date">
                {imovel.criadoEm && <p>Criado em: {formatDate(imovel.criadoEm)}</p>}
            </div>

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
