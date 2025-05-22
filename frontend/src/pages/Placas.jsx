// Placas.jsx
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

  const renderizarComponente = () => {
    switch (abaSelecionada) {
      case 'produzir':
        return <Produzir />;
      case 'pagar':
        return <Pagar />;
      case 'pago':
        return <Pago />;
      case 'disponíveis':
        return <Disponiveis />;
      case 'usadas':
        return <Usadas />;
      default:
        return null;
    }
  };

  const handleCriarPlaca = () => {
    // você pode fazer algo quando a placa for criada, ex: recarregar lista
    console.log('Placa criada!');
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <ul>
          <li
            className={abaSelecionada === 'produzir' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('produzir')}
          >
            Produzir
          </li>
          <li
            className={abaSelecionada === 'pagar' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('pagar')}
          >
            Pagar
          </li>
          <li
            className={abaSelecionada === 'pago' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('pago')}
          >
            Pago
          </li>
          <li
            className={abaSelecionada === 'disponíveis' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('disponíveis')}
          >
            Disponíveis
          </li>
          <li
            className={abaSelecionada === 'usadas' ? styles.ativo : ''}
            onClick={() => setAbaSelecionada('usadas')}
          >
            Usadas
          </li>
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
          onCriar={handleCriarPlaca}
        />
      )}
    </div>
  );
}
