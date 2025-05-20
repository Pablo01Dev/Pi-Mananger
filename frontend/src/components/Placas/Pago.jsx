import { useEffect, useState } from 'react';
import axios from 'axios';
import CardPlaca from './CardPagamento'; // Mantém o mesmo card
import styles from '../../styles/Pagar.module.css'; // Pode manter o estilo, ou criar outro se quiser
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';


export default function Pago() {
  const [placas, setPlacas] = useState([]);
  const [selecionadas, setSelecionadas] = useState([]);

  useEffect(() => {
    async function fetchPlacas() {
      try {
        const res = await axios.get('http://localhost:5000/api/placas');
        // Agora filtramos pelas placas com status 'pago'
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
    doc.text("Placas Pagas Exportadas", 14, 22);

    // Monta os dados da tabela, só com os selecionados
    const data = selecionadas.map(id => {
      const placa = placas.find(p => p._id === id);

      return [
        placa?.dataEnvio || 'N/A',
        placa?.titulo || 'N/A',
        placa?.conteudo || 'N/A',
        placa?.altura || 'N/A',
        placa?.largura || 'N/A',
        placa?.material || 'N/A',
        placa?.valor || 'N/A',
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

    // Cria a tabela
    autoTable(doc, {
      head: [columns.map(c => c.header)],
      body: data,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });

    doc.save('placas_pagas.pdf');
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
