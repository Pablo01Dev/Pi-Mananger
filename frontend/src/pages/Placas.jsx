import { useState } from 'react';
import styles from '../styles/Placas.module.css';
import Produzir from '../../src/components/Placas/Produzir';
import Pagar from '../../src/components/Placas/Pagar';
import Pago from '../../src/components/Placas/Pago';
import Disponiveis from '../../src/components/Placas/Disponiveis';
import Usadas from '../../src/components/Placas/Usadas';
import NovaPlaca from '../../src/components/Placas/NovaPlaca';

export default function Placas() {
  const [abaSelecionada, setAbaSelecionada] = useState('produzir');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // 👈 força recarregamento das abas

  const handleCriarPlaca = () => {
    // 🔄 ao criar uma nova placa, força recarregar o componente da aba ativa
    setReloadKey(prev => prev + 1);
    setMostrarModal(false);
  };

  const renderizarComponente = () => {
    switch (abaSelecionada) {
      case 'produzir':
        return <Produzir key={reloadKey} />;
      case 'pagar':
        return <Pagar key={reloadKey} />;
      case 'pago':
        return <Pago key={reloadKey} />;
      case 'disponíveis':
        return <Disponiveis key={reloadKey} />;
      case 'usadas':
        return <Usadas key={reloadKey} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <ul>
          {['produzir', 'pagar', 'pago', 'disponíveis', 'usadas'].map((aba) => (
            <li
              key={aba}
              className={abaSelecionada === aba ? styles.ativo : ''}
              onClick={() => setAbaSelecionada(aba)}
            >
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </li>
          ))}
        </ul>

        <div className={styles.novoButton}>
          <button type="button" onClick={() => setMostrarModal(true)}>
            <h4 className={styles.novo}>Nova placa</h4>
            <p className={styles.mais}>+</p>
          </button>
        </div>
      </nav>

      <div className={styles.conteudo}>
        {renderizarComponente()}
      </div>

      {mostrarModal && (
        <NovaPlaca
          onClose={() => setMostrarModal(false)}
          onCriar={handleCriarPlaca} // 🔄 agora recarrega a aba automaticamente
        />
      )}
    </div>
  );
}
