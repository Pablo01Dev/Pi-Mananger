import { useState, useEffect } from 'react'; // Importar useEffect
import axios from 'axios';
import styles from '../../styles/ModalNovo.module.css';
import { MdDelete } from "react-icons/md"
import { MdOutlineClose } from "react-icons/md";

export default function ModalEditarImovel({ imovel, onClose, onAtualizar, onExcluir }) {
    // Adicionar um useEffect para depurar os dados recebidos na prop imovel
    useEffect(() => {
        console.log("------------------------------------------");
        console.log("ModalEditarImovel: Imóvel recebido:", imovel);
        console.log("ModalEditarImovel: Imagens existentes (imovel.imagens):", imovel.imagens);
        if (imovel.imagens && imovel.imagens.length > 0) {
            imovel.imagens.forEach((img, index) => {
                console.log(`Imagem ${index + 1}: filename=${img.filename}, link=${img.link}`);
                if (!img.link) {
                    console.error(`AVISO: Imagem ${img.filename || index} não tem um 'link' definido!`);
                }
            });
        }
        console.log("------------------------------------------");
    }, [imovel]); // Executa uma vez quando o componente monta e quando a prop 'imovel' muda

    const [titulo, setTitulo] = useState(imovel.titulo);
    const [descricao, setDescricao] = useState(imovel.descricao);
    const [status, setStatus] = useState(imovel.status);
    const [novasImagensParaUpload, setNovasImagensParaUpload] = useState([]); // Arquivos de imagem selecionados para upload
    const [videosParaUpload, setVideosParaUpload] = useState([]); // Arquivos de vídeo selecionados para upload
    const [showCarousel, setShowCarousel] = useState(false);
    const [imagensExistentes, setImagensExistentes] = useState(imovel.imagens || []); // Imagens já salvas no imóvel
    const [imagensParaExcluir, setImagensParaExcluir] = useState([]); // Nomes de arquivo das imagens a serem excluídas
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0); // Para o carrossel

    const handleUpdate = async () => {
        try {
            // 1. Atualizar campos básicos do imóvel (título, descrição, status)
            await axios.put(`http://localhost:5000/api/imoveis/${imovel._id}`, {
                titulo,
                descricao,
                status,
            });

            // 2. Upload de novas imagens
            if (novasImagensParaUpload.length > 0) {
                const formDataImg = new FormData();
                // O nome 'arquivos' deve corresponder ao que você definiu no Multer (upload.array('arquivos'))
                novasImagensParaUpload.forEach(file => {
                    formDataImg.append('arquivos', file);
                });

                const response = await axios.post(
                    `http://localhost:5000/api/imoveis/${imovel._id}/imagens`,
                    formDataImg,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                // Adiciona as novas imagens retornadas pelo backend ao estado de imagens existentes
                // É CRÍTICO que response.data.imagens contenha os objetos de imagem com 'link' válido
                setImagensExistentes(prev => [...prev, ...response.data.imagens]);
            }

            // 3. Upload de novos vídeos
            if (videosParaUpload.length > 0) {
                const formDataVid = new FormData();
                formDataVid.append('arquivo', videosParaUpload[0]); // Apenas o primeiro vídeo, se múltiplo não for suportado
                await axios.post(
                    `http://localhost:5000/api/imoveis/${imovel._id}/videos`,
                    formDataVid,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                // Nota: O backend retorna o link do vídeo, você pode querer atualizar o estado do imóvel aqui
                // Para simplificar, estamos assumindo que o imovel.video será atualizado após o onAtualizar
            }

            // 4. Excluir imagens marcadas para exclusão
            for (const filename of imagensParaExcluir) {
                try {
                    // A rota de exclusão agora inclui o filename
                    await axios.delete(`http://localhost:5000/api/imoveis/${imovel._id}/imagens/${filename}`);
                } catch (err) {
                    console.error(`Erro ao excluir ${filename}:`, err.response?.data || err.message);
                    // Opcional: alertar o usuário sobre a falha de exclusão de uma imagem específica
                }
            }

            alert('Atualização concluída!');

            // Fechar modal e chamar callback de atualização
            setTimeout(() => {
                onClose();
                if (onAtualizar) onAtualizar(); // Recarrega os dados do imóvel principal
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

    // Remove imagem da pré-visualização e marca para exclusão no backend
    const handleDeleteImage = (filename) => {
        // Filtra para remover a imagem do estado local
        setImagensExistentes(prev => prev.filter(img => img.filename !== filename));
        // Adiciona o filename à lista de imagens a serem excluídas no backend
        setImagensParaExcluir(prev => [...prev, filename]);
    };

    // Lida com a seleção de novas imagens
    const handleNewImageChange = (e) => {
        setNovasImagensParaUpload(Array.from(e.target.files));
    };

    // Lida com a seleção de novos vídeos
    const handleVideoChange = (e) => {
        setVideosParaUpload(Array.from(e.target.files));
    };

    const nextImage = () => {
        setCurrentCarouselIndex((prevIndex) =>
            (prevIndex + 1) % imagensExistentes.length
        );
    };

    const prevImage = () => {
        setCurrentCarouselIndex((prevIndex) =>
            (prevIndex - 1 + imagensExistentes.length) % imagensExistentes.length
        );
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
                    {/* Exibição de Imagens Existentes (via Dropbox Link) */}
                    <label>Imagens Existentes</label>
                    {imagensExistentes?.length > 0 ? (
                        <div className={styles.existingImagesContainer}>
                            {imagensExistentes.map((img, index) => (
                                // Renderiza a imagem APENAS se houver um link válido
                                img.link ? (
                                    <div key={img.filename || index} className={styles.imagemPreviewWrapper}>
                                        <img
                                            src={img.link} // AGORA USA O LINK DO DROPBOX!
                                            // Corrigido: Usar filename ou um texto genérico com o índice
                                            alt={img.filename ? `Imagem ${img.filename}` : `Imagem existente ${index + 1}`}
                                            className={styles.imagemPreview}
                                            onClick={() => {
                                                setShowCarousel(true);
                                                setCurrentCarouselIndex(index); // Abre o carrossel na imagem clicada
                                            }}
                                        />
                                        <div className={styles.imagemOverlay}>
                                            <button
                                                className={styles.iconeLixeira}
                                                onClick={() => handleDeleteImage(img.filename)}
                                                title="Remover imagem existente"
                                            >
                                                <MdDelete />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Mostra um aviso se o link estiver faltando
                                    <div key={img.filename || index} className={styles.imagemPreviewWrapper}>
                                        <p className={styles.noImageLink}>Link da imagem '{img.filename || `Imagem ${index + 1}`}' não disponível.</p>
                                        <div className={styles.imagemOverlay}>
                                            <button
                                                className={styles.iconeLixeira}
                                                onClick={() => handleDeleteImage(img.filename)}
                                                title="Remover imagem sem link"
                                            >
                                                <MdDelete />
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <p>Nenhuma imagem existente para este imóvel.</p>
                    )}


                    <label>Adicionar Novas Imagens</label>
                    <input
                        type="file"
                        id="inputNovasImagens"
                        style={{ display: 'none' }}
                        className={styles.inputArquivo}
                        multiple
                        accept="image/*"
                        onChange={handleNewImageChange}
                    />
                    <label htmlFor="inputNovasImagens" className={styles.botaoUpload}>Selecionar Novas Imagens</label>

                    {/* Pré-visualização de NOVAS imagens selecionadas ANTES do upload */}
                    {novasImagensParaUpload.length > 0 && (
                        <div className={styles.previewContainer}>
                            <h4>Imagens para Upload:</h4>
                            {novasImagensParaUpload.map((file, index) => (
                                <div key={index} className={styles.imagemPreviewWrapper}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`nova-preview-${index}`} // Este já estava ok
                                        className={styles.imagemPreview}
                                    />
                                    <div className={styles.imagemOverlay}>
                                        <button
                                            className={styles.iconeLixeira}
                                            onClick={() => {
                                                setNovasImagensParaUpload(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            title="Remover da seleção"
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}


                    <label>Vídeo</label>
                    {imovel.video?.link && ( // Exibe o vídeo existente
                        <div className={styles.videoPreviewContainer}>
                            <video controls className={styles.videoPreview}>
                                <source src={imovel.video.link} type="video/mp4" />
                                Seu navegador não suporta a tag de vídeo.
                            </video>
                            <p>Vídeo atual: {imovel.video.nome || 'Sem nome'}</p>
                        </div>
                    )}

                    <label>Adicionar/Substituir Vídeo</label>
                    <input
                        type="file"
                        id="inputVideo"
                        style={{ display: 'none' }}
                        className={styles.inputArquivo}
                        accept="video/mp4"
                        onChange={handleVideoChange}
                    />
                    <label htmlFor="inputVideo" className={styles.botaoUpload}>Selecionar Novo Vídeo (MP4)</label>

                    {videosParaUpload.length > 0 && (
                        <p>Vídeo selecionado para upload: {videosParaUpload[0].name}</p>
                    )}


                    <div className={styles.footerButtons}>
                        <button className={styles.saveButton} onClick={handleUpdate}>Salvar alterações</button>
                    </div>
                </div>
            </div>

            {/* Carrossel de Imagens */}
            {showCarousel && imagensExistentes.length > 0 && (
                <div className={styles.carouselOverlay} onClick={() => setShowCarousel(false)}>
                    <div className={styles.carouselTop}>
                        <button className={styles.carouselCloseButton} onClick={() => setShowCarousel(false)}>Fechar</button>
                    </div>
                    <div className={styles.carousel} onClick={(e) => e.stopPropagation()}>
                        {imagensExistentes.length > 1 && (
                            <>
                                <button className={styles.carouselNavButtonLeft} onClick={prevImage}>❮</button>
                                <button className={styles.carouselNavButtonRight} onClick={nextImage}>❯</button>
                            </>
                        )}
                        <div className={styles.carouselItem}>
                            {/* Corrigido: Usar filename ou um texto genérico com o índice */}
                            {/* Adicionado optional chaining (?.) para prevenir erros se imagensExistentes[currentCarouselIndex] for undefined por um breve momento */}
                            {imagensExistentes[currentCarouselIndex]?.link ? (
                                <img
                                    src={imagensExistentes[currentCarouselIndex].link}
                                    alt={imagensExistentes[currentCarouselIndex]?.filename || `Imagem do carrossel ${currentCarouselIndex + 1}`}
                                />
                            ) : (
                                <p className={styles.noImageLink}>Link da imagem não disponível no carrossel.</p>
                            )}

                            <button
                                className={styles.imageDeleteButton}
                                onClick={() => {
                                    // Verifica se a imagem atual existe antes de tentar excluir
                                    if (imagensExistentes[currentCarouselIndex]?.filename) {
                                        handleDeleteImage(imagensExistentes[currentCarouselIndex].filename);
                                        // Se a imagem excluída era a última, redefine o índice ou fecha o carrossel
                                        if (imagensExistentes.length === 1) {
                                            setShowCarousel(false);
                                        } else {
                                            // Ajusta o índice para a próxima imagem ou para o início se for a última
                                            setCurrentCarouselIndex(prev =>
                                                (prev + 1) % (imagensExistentes.length - 1 || 1)
                                            );
                                        }
                                    }
                                }}
                            >
                                Excluir Imagem
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão de Imóvel */}
            {mostrarConfirmacao && (
                <div
                    className={styles.confirmacaoOverlay}
                    onClick={() => {
                        if (!isDeleting) {
                            setMostrarConfirmacao(false);
                        }
                    }}
                >
                    <div
                        className={styles.confirmacaoModal}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <h3>Tem certeza que deseja excluir este imóvel?</h3>
                        <div className={styles.botoesConfirmacao}>
                            <button
                                className={styles.confirmarButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImovel();
                                }}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                            <button
                                className={styles.cancelarButton}
                                onClick={() => setMostrarConfirmacao(false)}
                                disabled={isDeleting}
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