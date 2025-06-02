import { useEffect, useState } from 'react';
import axios from 'axios';
import CardPlaca from './CardPagamento';
import styles from '../../styles/Pagar.module.css';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

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
    // Certifique-se de que o valor é um número
    const numericValue = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    if (isNaN(numericValue)) return 'N/A'; // Verifica se a conversão resultou em um número válido
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
        const res = await axios.get('http://localhost:5000/api/placas');
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
      await axios.delete(`http://localhost:5000/api/placas/${id}`);
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

    doc.setFontSize(18);
    // Adiciona o título com a data de exportação dinâmica
    const dataExportacao = new Date().toLocaleDateString('pt-BR');
    doc.text(`Relatório de Placas Pagas - ${dataExportacao}`, 14, 22);

    // Monta os dados da tabela, já com as formatações aplicadas
    const data = selecionadas.map(id => {
      const placa = placas.find(p => p._id === id);

      return [
        formatarData(placa?.dataEnvio),
        placa?.titulo || 'N/A',
        placa?.conteudo || 'N/A',
        placa?.altura ? `${placa.altura} cm` : 'N/A', // Adicionando unidade
        placa?.largura ? `${placa.largura} cm` : 'N/A', // Adicionando unidade
        placa?.material || 'N/A',
        formatarMoeda(placa?.valor),
      ];
    });

    // Define as colunas da tabela
    const columns = [
      { header: 'Data de envio', dataKey: 'dataEnvio' },
      { header: 'Título', dataKey: 'titulo' },
      { header: 'Conteúdo', dataKey: 'conteudo' },
      { header: 'Altura', dataKey: 'altura' },
      { header: 'Largura', dataKey: 'largura' },
      { header: 'Material', dataKey: 'material' },
      { header: 'Valor', dataKey: 'valor' },
    ];

    // Cria a tabela com estilos aprimorados
    autoTable(doc, {
      head: [columns.map(c => c.header)],
      body: data,
      startY: 35, // Aumenta o startY para dar espaço ao título
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [180, 180, 180], // Cor da borda da célula
        lineWidth: 0.1, // Largura da borda da célula
      },
      headStyles: {
        fillColor: [36, 113, 163], // Um azul um pouco mais escuro para o cabeçalho
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center', // Centraliza o texto do cabeçalho
      },
      bodyStyles: {
        textColor: [50, 50, 50], // Cor do texto principal
      },
      alternateRowStyles: {
        fillColor: [247, 247, 247], // Cor de preenchimento para linhas alternadas
      },
      columnStyles: {
        // Estilos específicos por coluna
        0: { cellWidth: 25 }, // Data de Envio
        1: { cellWidth: 'auto' }, // Título
        2: { cellWidth: 'auto', minCellHeight: 15 }, // Conteúdo, para quebrar linha se for longo
        3: { halign: 'center' }, // Altura
        4: { halign: 'center' }, // Largura
        5: { cellWidth: 25 }, // Material
        6: { halign: 'right' }, // Valor (importante para moeda)
      },
      margin: { top: 25, bottom: 25, left: 14, right: 14 }, // Margens maiores
      tableWidth: 'wrap', // Ajusta a largura da tabela automaticamente
      didDrawPage: (data) => {
        // Adicionar numeração de página no rodapé
        doc.setFontSize(8);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);

        // Exemplo de como adicionar um logo (descomente e substitua 'base64Image' pela sua imagem em base64)
        // const base64Image = 'data:image/png;base64,...'; // Sua imagem logo em Base64
        // if (base64Image) {
        //   doc.addImage(base64Image, 'PNG', doc.internal.pageSize.width - 50, 10, 40, 20); // Posição: (x, y, width, height)
        // }
      },
    });

    doc.save('relatorio_placas_pagas.pdf'); // Nome do arquivo mais descritivo
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