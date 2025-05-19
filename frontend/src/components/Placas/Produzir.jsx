// Produzir.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import CardPlaca from './CardPlaca';
import styles from '../../styles/Produzir.module.css';

const categorias = ['Alugue', 'Compre', 'Compre e Alugue', 'Outros'];

export default function Produzir() {
    const [placas, setPlacas] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState('Alugue');

    useEffect(() => {
        async function fetchPlacas() {
            try {
                const res = await axios.get('http://localhost:3000/api/placas');
                setPlacas(res.data);
            } catch (error) {
                console.error('Erro ao buscar placas:', error);
            }
        }
        fetchPlacas();
    }, []);

    const handleEnviar = async (id) => {
        await axios.put(`http://localhost:3000/api/placas/enviar/${id}`);
        setPlacas(prev =>
            prev.map(p => p._id === id ? { ...p, status: 'pagar' } : p)
        );
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/api/placas/${id}`);
        setPlacas(prev => prev.filter(p => p._id !== id));
    };

    const placasFiltradas = placas.filter(p => p.categoria === categoriaAtiva && p.status === 'produzir');

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {categorias.map(cat => (
                    <button
                        key={cat}
                        className={categoriaAtiva === cat ? styles.activeTab : ''}
                        onClick={() => setCategoriaAtiva(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className={styles.cards}>
                {placasFiltradas.map(placa => (
                    <CardPlaca
                        key={placa._id}
                        placa={placa}
                        onEnviar={handleEnviar}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
