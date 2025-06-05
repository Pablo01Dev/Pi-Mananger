import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/ModalNovo.module.css';
import { FiTrash } from 'react-icons/fi';
import { MdOutlineClose } from "react-icons/md";

export default function ModalNovoImovel({ onClose, onCriar }) {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('cadastrar');
    const [arquivosImagens, setArquivosImagens] = useState([]); // Renomeado para clareza
    const [arquivoVideo, setArquivoVideo] = useState(null); // Usar null para um único arquivo de vídeo
    const [isLoading, setIsLoading] = useState(false);

    // Gera URLs para preview e libera memória quando arquivos mudam ou são removidos
    const [previewImagens, setPreviewImagens] = useState([]);
    const [previewVideo, setPreviewVideo] = useState(null); // Usar null para um único preview de vídeo

    useEffect(() => {
        // Cria URLs para imagens
        const imagensPreview = arquivosImagens.map(file => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setPreviewImagens(imagensPreview);

        return () => {
            imagensPreview.forEach(({ url }) => URL.revokeObjectURL(url));
        };
    }, [arquivosImagens]);

    useEffect(() => {
        // Cria URL para vídeo (se houver)
        if (arquivoVideo) {
            const videoPreview = {
                file: arquivoVideo,
                url: URL.createObjectURL(arquivoVideo),
            };
            setPreviewVideo(videoPreview);
            return () => {
                URL.revokeObjectURL(videoPreview.url);
            };
        } else {
            setPreviewVideo(null);
        }
    }, [arquivoVideo]);

    const handleCreate = async () => {
        if (!titulo.trim()) {
            alert('O campo título é obrigatório.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Criar o Imóvel no Backend (sem arquivos inicialmente)
            const response = await axios.post('http://localhost:5000/api/imoveis', {
                titulo,
                descricao,
                status,
            });

            const novoImovel = response.data.imovel; // O backend retorna { sucesso: true, imovel: novoImovel }

            // 2. Upload de Imagens, se houver
            if (arquivosImagens.length > 0) {
                const formDataImagens = new FormData();
                // 'arquivos' deve corresponder ao nome do campo no `upload.array()` do Multer no backend
                arquivosImagens.forEach(file => {
                    formDataImagens.append('arquivos', file);
                });

                await axios.post(
                    `http://localhost:5000/api/imoveis/${novoImovel._id}/imagens`, // Nova rota para imagens
                    formDataImagens,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            // 3. Upload de Vídeo, se houver
            if (arquivoVideo) {
                const formDataVideo = new FormData();
                // 'arquivo' deve corresponder ao nome do campo no `upload.single()` do Multer no backend
                formDataVideo.append('arquivo', arquivoVideo);

                await axios.patch( // Use PATCH para atualizar um recurso existente
                    `http://localhost:5000/api/imoveis/${novoImovel._id}/video`, // Nova rota para vídeo
                    formDataVideo,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            alert('Imóvel criado com sucesso e arquivos enviados!');
            onCriar(); // Chama a função para recarregar a lista de imóveis
            onClose(); // Fecha o modal

        } catch (err) {
            console.error('Erro ao criar imóvel:', err.response?.data || err.message);
            alert('Erro ao criar imóvel: ' + (err.response?.data?.erro || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.modal} ${styles.novoImovel}`}>
            <div className={styles.modalContent}>
                <div className={styles.topButtons}>
                    <button className={styles.closeButton} onClick={onClose}>
                        <MdOutlineClose />
                    </button>
                </div>

                <div className={styles.body}>
                    <h2>Novo Imóvel</h2>

                    <label>Título</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                    />

                    <label>Descrição</label>
                    <textarea
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                    />

                    <label>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="cadastrar">Cadastrar</option>
                        <option value="fazer video">Fazer Vídeo</option>
                        <option value="fazer tour 360º">Fazer Tour 360º</option>
                        <option value="concluído">Concluído</option>
                    </select>

                    {/* Input e pré-visualização de Imagens */}
                    <label>Imagens</label>
                    <input
                        type="file"
                        id="inputImagem"
                        style={{ display: 'none' }}
                        multiple
                        accept="image/*"
                        onChange={e => setArquivosImagens(Array.from(e.target.files))}
                    />
                    <label htmlFor="inputImagem" className={styles.botaoUpload}>
                        Adicionar imagem(ns)
                    </label>

                    {previewImagens.length > 0 && (
                        <div className={styles.previewContainer}>
                            {previewImagens.map(({ url }, index) => (
                                <div key={index} className={styles.imagemPreviewWrapper}>
                                    <img
                                        src={url}
                                        alt={`preview-${index}`}
                                        className={styles.imagemPreview}
                                    />
                                    <div className={styles.imagemOverlay}>
                                        <button
                                            className={styles.iconeLixeira}
                                            onClick={() =>
                                                setArquivosImagens(prev => prev.filter((_, i) => i !== index))
                                            }
                                            title="Remover da seleção"
                                        >
                                            <FiTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input e pré-visualização de Vídeo */}
                    <label>Vídeo</label>
                    <input
                        type="file"
                        id="inputVideo"
                        style={{ display: 'none' }}
                        accept="video/mp4"
                        onChange={e => setArquivoVideo(e.target.files[0] || null)} // Pega apenas o primeiro arquivo
                    />
                    <label htmlFor="inputVideo" className={styles.botaoUpload}>
                        Adicionar vídeo (MP4)
                    </label>

                    {previewVideo && (
                        <div className={styles.previewContainer}>
                            <div className={styles.imagemPreviewWrapper}> {/* Reutilizando o estilo */}
                                <video
                                    src={previewVideo.url}
                                    controls
                                    className={styles.imagemPreview} // Reutilizando estilo para ajustar tamanho
                                />
                                <div className={styles.imagemOverlay}>
                                    <button
                                        className={styles.iconeLixeira}
                                        onClick={() => setArquivoVideo(null)}
                                        title="Remover vídeo"
                                    >
                                        <FiTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.footerButtons}>
                        <button
                            className={styles.saveButton}
                            onClick={handleCreate}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Criando Imóvel...' : 'Criar Imóvel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}