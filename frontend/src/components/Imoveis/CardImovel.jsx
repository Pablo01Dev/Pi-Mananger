import { useState } from 'react';
import ModalEditarImovel from './ModalEditarImovel';
import styles from '../../styles/CardImovel.module.css';

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

export default function CardImovel({ imovel, onAtualizar, onExcluir }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Função utilitária para ajustar link do Dropbox
    const getDropboxRawLink = (link) => {
        return link ? link.replace('dl=0', 'raw=1') : '';
    };

    return (
        <div className={styles.cardImovel} onClick={() => setIsModalOpen(true)}>
            <div className={styles.statusBar}>
                <p>{imovel.status}</p>
                <div
                    className={styles.statusColor}
                    style={{ backgroundColor: getStatusColor(imovel.status) }}
                />
            </div>

            <h3>{imovel.titulo}</h3>
            <p className={styles.descriptCard}>{imovel.descricao}</p>

            <div className={styles.media}>
                {/* Verifica se imovel.imagens existe e tem itens antes de mapear */}
                {imovel.imagens && imovel.imagens.length > 0 ? (
                    imovel.imagens.map((img, idx) => (
                        img && img.link ? (
                            <img
                                key={img.filename || idx}
                                src={getDropboxRawLink(img.link)} // aqui fazemos a conversão
                                alt={img.nome || `Imagem ${idx}`}
                                className={styles.mediaImage}
                            />
                        ) : (
                            <p key={idx}>Imagem indisponível</p>
                        )
                    ))
                ) : (
                    <p>Nenhuma imagem.</p>
                )}
            </div>

            {/* Adicione o vídeo aqui se o card também precisar exibi-lo */}
            {imovel.video && imovel.video.link ? (
                <div className={styles.media}>
                    <video controls className={styles.mediaVideo}>
                        <source src={getDropboxRawLink(imovel.video.link)} type="video/mp4" />
                        Seu navegador não suporta vídeos.
                    </video>
                </div>
            ) : null}

            <div className={styles.date}>
                {imovel.criadoEm && <p>Criado em: {formatDate(imovel.criadoEm)}</p>}
            </div>

            {isModalOpen && (
                <ModalEditarImovel
                    imovel={imovel}
                    onClose={() => setIsModalOpen(false)}
                    onAtualizar={onAtualizar}
                    onExcluir={onExcluir}
                />
            )}
        </div>
    );
}
