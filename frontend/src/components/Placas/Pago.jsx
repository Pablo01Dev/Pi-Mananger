import { useEffect, useState } from 'react';
import axios from 'axios';
import CardPlaca from './CardPagamento';
import styles from '../../styles/Pagar.module.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Definição dinâmica da URL da API
const API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/placas`
    : 'http://localhost:5000/api/placas';

// Funções de formatação
const formatarData = (dataString) => {
  if (!dataString) return 'N/A';
  try {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
  } catch (error) {
    console.error("Erro ao formatar data:", dataString, error);
    return 'N/A';
  }
};

const formatarMoeda = (valor) => {
  if (valor === undefined || valor === null) return 'N/A';
  try {
    const numericValue = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    if (isNaN(numericValue)) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  } catch (error) {
    console.error("Erro ao formatar moeda:", valor, error);
    return 'N/A';
  }
};

export default function Pago() {
  const [placas, setPlacas] = useState([]);
  const [selecionadas, setSelecionadas] = useState([]);

  useEffect(() => {
    async function fetchPlacas() {
      try {
        const res = await axios.get(API_URL);
        const placasPagas = res.data.filter(
          p => p.status?.toLowerCase() === 'pago'
        );
        setPlacas(placasPagas);
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      }
    }
    fetchPlacas();
  }, []);

  const handleSelecionar = (id) => {
    setSelecionadas(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setPlacas(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Erro ao deletar a placa:', error);
      alert('Falha ao deletar a placa.');
    }
  };

  const exportarSelecionados = () => {
    if (selecionadas.length === 0) {
      alert('Selecione pelo menos uma placa para exportar.');
      return;
    }

    const doc = new jsPDF();
    const dataExportacao = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(18);
    doc.text(`Relatório de Placas Pagas - ${dataExportacao}`, 14, 22);

    const data = selecionadas.map(id => {
      const placa = placas.find(p => p._id === id);
      return [
        formatarData(placa?.dataEnvio),
        placa?.titulo || 'N/A',
        placa?.conteudo || 'N/A',
        placa?.altura ? `${placa.altura} cm` : 'N/A',
        placa?.largura ? `${placa.largura} cm` : 'N/A',
        placa?.material || 'N/A',
        formatarMoeda(placa?.valor),
      ];
    });

    const columns = ['Data de envio', 'Título', 'Conteúdo', 'Altura', 'Largura', 'Material', 'Valor'];

    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [36, 113, 163], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 247, 247] },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
    });

    doc.save('relatorio_placas_pagas.pdf');
  };

  return (
    <div className={styles.pagarContainer}>
      <div className={styles.heroTitle}>
        <h2>Pagos</h2>
        <div>
          {selecionadas.length > 0 && (
            <button onClick={exportarSelecionados} className={styles.botaoPagar}>
              Exportar ({selecionadas.length})
            </button>
          )}
        </div>
      </div>
      <div className={styles.cards}>
        {placas.length > 0 ? (
          placas.map(placa => (
            <CardPlaca
              key={placa._id}
              placa={placa}
              selecionado={selecionadas.includes(placa._id)}
              onSelect={handleSelecionar}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className={styles.semPlacas}>Nenhuma placa paga.</p>
        )}
      </div>
    </div>
  );
}
