import { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/ModalEditarImovel.module.css';
import { FiTrash } from 'react-icons/fi';
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

            setTimeout(() => {
                onClose();
                if (onAtualizar) onAtualizar();
            }, 500);
        } catch (err) {
            console.error('Erro ao atualizar imóvel:', err.response ? err.response.data : err.message);
            alert('Erro ao atualizar imóvel.');
        }
    };

    const handleDeleteImage = (filename) => {
        setImagensParaExcluir((prev) => [...prev, filename]);
        setImagens((prev) => prev.filter(img => img.filename !== filename));
    };

    const handleDeleteImovel = async () => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/imoveis/${imovel._id}`);

            if (response.status === 200) {
                alert('Imóvel excluído com sucesso!');
                onExcluir(imovel._id);


                setTimeout(() => {
                    onClose();
                }, 500);
            }
        } catch (err) {
            const errorMessage = err.response ? err.response.data.erro || err.response.data : err.message;
            console.error('Erro ao excluir imóvel:', errorMessage);
            alert(`Erro ao excluir imóvel: ${errorMessage}`);
        }
    };


    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.topButtons}>
                    <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("Função onExcluir chamada");
                            onExcluir(imovel._id);
                        }}
                    >
                        Excluir Imóvel
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
                                            <FiTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>


                    )}

                    <label htmlFor="inputImagem" className={styles.botaoUpload}>
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

                    <label htmlFor="inputVideo" className={styles.botaoUpload}>
                        Adicionar vídeo
                    </label>
                    <div className={styles.footerButtons}>
                        <button className={styles.saveButton} onClick={handleUpdate}>Salvar alterações</button>
                    </div>
                </div>

            </div>

            {showCarousel && (
                <div className={styles.carouselOverlay}>
                    <div className={styles.carouselTop}>
                        <button className={styles.carouselCloseButton} onClick={() => setShowCarousel(false)}>Fechar</button>
                    </div>
                    <div className={styles.carousel}>
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
        </div>
    );
}
