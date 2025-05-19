import { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/ModalImovel.module.css';
import { MdDelete } from "react-icons/md"
import { MdOutlineClose } from "react-icons/md";

export default function ModalEditarImovel({ imovel, onClose, onAtualizar, onExcluir }) {
    const [titulo, setTitulo] = useState(imovel.titulo);
    const [descricao, setDescricao] = useState(imovel.descricao);
    const [status, setStatus] = useState(imovel.status);
    const [arquivos, setArquivos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [showCarousel, setShowCarousel] = useState(false);
    const [imagens, setImagens] = useState(imovel.imagens || []);
    const [imagensParaExcluir, setImagensParaExcluir] = useState([]);
    const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/imoveis/${imovel._id}`, {
                titulo,
                descricao,
                status,
            });

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

            for (const vid of videos) {
                const formDataVid = new FormData();
                formDataVid.append('arquivo', vid);
                await axios.post(
                    `http://localhost:5000/api/upload/${imovel._id}/videos`,
                    formDataVid,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            for (const filename of imagensParaExcluir) {
                try {
                    await axios.delete(`http://localhost:5000/api/upload/${imovel._id}/${filename}`);
                } catch (err) {
                    console.error(`Erro ao excluir ${filename}:`, err.response?.data || err.message);
                }
            }

            alert('Atualização concluída!');

            setTimeout(() => {
                onClose();
                if (onAtualizar) onAtualizar();
            }, 500);
        } catch (err) {
            console.error('Erro ao atualizar imóvel:', err.response ? err.response.data : err.message);
            alert('Erro ao atualizar imóvel.');
        }
    };

    const handleDeleteImovel = async () => {
        if (isDeleting) return;
        setIsDeleting(true);

        try {
            const response = await axios.delete(`http://localhost:5000/api/imoveis/${imovel._id}`);

            if (response.status === 200) {
                // MANTENHA APENAS UM ALERTA AQUI
                alert('Imóvel excluído com sucesso!');
                if (onExcluir) onExcluir(imovel._id);
                setMostrarConfirmacao(false);
                setTimeout(onClose, 300);
            }
        } catch (err) {
            console.error('Erro ao excluir imóvel:', err);
            alert('Erro ao excluir imóvel.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteImage = (filename) => {
        // Remove a imagem da lista visualmente
        setImagens(prev => prev.filter(img => img.filename !== filename));

        // Adiciona o filename para exclusão no backend
        setImagensParaExcluir(prev => [...prev, filename]);
    };



    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.topButtons}>
                    <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMostrarConfirmacao(true);
                        }}
                    >
                        <MdDelete />
                        <span className={styles.tooltip}>Excluir imóvel</span>
                    </button>

                    <button className={styles.closeButton} onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}>
                        <MdOutlineClose />
                    </button>
                </div>


                <div className={styles.body}>
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
                </div>

                <div className={styles.arquivoUpload}>
                    <label>Imagens</label>
                    {imagens?.length > 0 && (
                        <img
                            src={`http://localhost:5000/${imagens[0].path.replace(/\\/g, '/')}`}
                            alt="Imagem principal"
                            className={styles.imagemPreview}
                            onClick={() => setShowCarousel(true)}
                        />
                    )}

                    <input
                        type="file"
                        id="inputImagem"
                        style={{ display: 'none' }}
                        className={styles.inputArquivo}
                        multiple
                        accept="image/*"
                        onChange={e => setArquivos(Array.from(e.target.files))}
                    />

                    {arquivos.length > 0 && (
                        <div className={styles.previewContainer}>
                            {arquivos.map((file, index) => (
                                <div key={index} className={styles.imagemPreviewWrapper}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`preview-${index}`}
                                        className={styles.imagemPreview}
                                    />
                                    <div className={styles.imagemOverlay}>
                                        <button
                                            className={styles.iconeLixeira}
                                            onClick={() => {
                                                setArquivos(prev => prev.filter((_, i) => i !== index));
                                            }}
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <label htmlFor="inputImagem" className={styles.botaoUpload}>Adicionar imagem</label>

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

                    <label htmlFor="inputVideo" className={styles.botaoUpload}>Adicionar vídeo</label>

                    <div className={styles.footerButtons}>
                        <button className={styles.saveButton} onClick={handleUpdate}>Salvar alterações</button>
                    </div>
                </div>
            </div>

            {showCarousel && (
                <div className={styles.carouselOverlay} onClick={() => setShowCarousel(false)}>
                    <div className={styles.carouselTop}>
                        <button className={styles.carouselCloseButton} onClick={() => setShowCarousel(false)}>Fechar</button>
                    </div>
                    <div className={styles.carousel} onClick={(e) => e.stopPropagation()}>
                        {imagens.map((img, idx) => (
                            <div key={idx} className={styles.carouselItem}>
                                <img src={`http://localhost:5000/${img.path.replace(/\\/g, '/')}`} alt={`Imagem ${idx}`} />
                                <button
                                    className={styles.imageDeleteButton}
                                    onClick={() => handleDeleteImage(img.filename)}
                                >
                                    Excluir
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {mostrarConfirmacao && (
                <div
                    className={styles.confirmacaoOverlay}
                    onClick={() => {
                        // Apenas fecha o modal se o usuário clicar fora da caixa de confirmação e não tiver confirmado a exclusão
                        if (!isDeleting) { // Verifica se a exclusão não está em andamento
                            setMostrarConfirmacao(false);
                        }
                    }}
                >
                    <div
                        className={styles.confirmacaoModal}
                        onClick={(e) => {
                            // Impede que o clique no modal (dentro da caixa) feche o modal
                            e.stopPropagation();
                        }}
                    >
                        <h3>Tem certeza que deseja excluir este imóvel?</h3>
                        <div className={styles.botoesConfirmacao}>
                            <button
                                className={styles.confirmarButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImovel(); // Chama a função de exclusão
                                }}
                            >
                                Sim, excluir
                            </button>
                            <button
                                className={styles.cancelarButton}
                                onClick={() => setMostrarConfirmacao(false)} // Fecha o modal no "Cancelar"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
