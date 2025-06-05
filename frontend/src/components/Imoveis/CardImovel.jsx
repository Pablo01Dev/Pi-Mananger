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

    // Adicione um console.log aqui para inspecionar o objeto 'imovel'
    // quando o erro ocorrer, ele vai te ajudar a ver a estrutura dos dados.
    // console.log("Imóvel no CardImovel:", imovel);

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
                        // Verifica se img e img.link existem para evitar erros de undefined
                        img && img.link ? (
                            <img
                                key={img.filename || idx} // Use img.filename como key se disponível, senão idx
                                src={img.link} // Use DIRETAMENTE o link do Dropbox!
                                alt={img.nome || `Imagem ${idx}`} // Use img.nome ou um fallback
                                className={styles.mediaImage}
                            />
                        ) : (
                            // Fallback caso a imagem ou o link estejam undefined (improvável, mas bom para robustez)
                            <p key={idx}>Imagem indisponível</p>
                        )
                    ))
                ) : (
                    // Mensagem se não houver imagens
                    <p>Nenhuma imagem.</p>
                )}
            </div>
            
            {/* Adicione o vídeo aqui se o card também precisar exibi-lo */}
            {imovel.video && imovel.video.link ? (
                <div className={styles.media}> {/* Pode ajustar o estilo se precisar */}
                    <video controls className={styles.mediaVideo}> {/* Adicione uma classe CSS para vídeos se precisar */}
                        <source src={imovel.video.link} type="video/mp4" />
                        Seu navegador não suporta vídeos.
                    </video>
                    {/* <p>{imovel.video.nome}</p> */}
                </div>
            ) : (
                // <p>Nenhum vídeo.</p> // Opcional: mostrar mensagem se não houver vídeo
                null // Não mostra nada se não houver vídeo
            )}

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