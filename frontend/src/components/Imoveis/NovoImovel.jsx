import { useState } from 'react';
import api from '../../api';
import styles from '../../styles/ModalNovo.module.css';
import { MdOutlineClose, MdMyLocation } from "react-icons/md";

export default function ModalNovoImovel({ onClose, onCriar }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco] = useState(''); // 🆕 novo campo
  const [status, setStatus] = useState('cadastrar');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // 🧭 controle de GPS

  // ==================================================
  // 📍 Obter localização atual via GPS + OpenStreetMap
  // ==================================================
  const handleUsarLocalizacao = () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não suporta geolocalização.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // 🗺️ Consulta reversa ao OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();

          const { road, house_number, suburb, city, town, state } = data.address || {};
          const enderecoFormatado =
            `${road || ''} ${house_number || ''}, ${suburb || city || town || ''} - ${state || ''}`.trim();

          if (enderecoFormatado) setEndereco(enderecoFormatado);
          else setEndereco(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);

        } catch (err) {
          console.error('Erro ao buscar endereço:', err);
          alert('Não foi possível obter o endereço automaticamente.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Erro ao acessar localização:', error);
        alert('Não foi possível acessar sua localização.');
        setIsLocating(false);
      }
    );
  };

  // ==================================================
  // 🏗️ Criar imóvel
  // ==================================================
  const handleCreate = async () => {
    if (!titulo.trim()) {
      alert('O campo título é obrigatório.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/imoveis', { titulo, descricao, endereco, status });

      if (res.status === 200 || res.status === 201) {
        alert('Imóvel criado com sucesso!');
        if (onCriar) onCriar(res.data);
        onClose();
      } else {
        console.warn('Resposta inesperada:', res);
        alert('Servidor respondeu com código inesperado.');
      }
    } catch (err) {
      console.error('Erro ao criar imóvel:', err);
      const msg = err.response?.data?.erro || err.message || 'Erro desconhecido';
      alert('Erro ao criar imóvel: ' + msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================================================
  // 🧱 Render
  // ==================================================
  return (
    <div className={`${styles.modal} ${styles.novoImovel}`}>
      <div className={styles.modalContent}>
        {/* Botão de fechar */}
        <div className={styles.topButtons}>
          <button className={styles.closeButton} onClick={onClose}>
            <MdOutlineClose />
          </button>
        </div>

        {/* Corpo do modal */}
        <div className={styles.body}>
          <h2>Novo Imóvel</h2>

          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Cobertura em Icaraí"
          />

          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Breve descrição do imóvel..."
          />

          {/* 🏠 Campo de Endereço + botão GPS */}
          <label htmlFor="endereco">Endereço</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="endereco"
              type="text"
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              placeholder="Digite ou use o GPS..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleUsarLocalizacao}
              className={styles.gpsButton}
              disabled={isLocating}
              title="Usar localização atual"
            >
              <MdMyLocation />
            </button>
          </div>

          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="cadastrar">Cadastrar</option>
            <option value="fazer video">Fazer Vídeo</option>
            <option value="fazer tour 360º">Fazer Tour 360º</option>
            <option value="concluído">Concluído</option>
          </select>

          <div className={styles.footerButtons}>
            <button
              className={styles.saveButton}
              onClick={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Imóvel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
