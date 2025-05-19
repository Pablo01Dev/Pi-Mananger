// Placas.jsx
import { useState } from 'react';
import styles from '../styles/Placas.module.css';
import Produzir from '../../src/components/Placas/Produzir';
import Pagar from '../../src/components/Placas/Pagar';
import Pago from '../../src/components/Placas/Pago';
import Disponiveis from '../../src/components/Placas/Disponiveis';
import Usadas from '../../src/components/Placas/Usadas';

export default function Placas() {
  const [abaSelecionada, setAbaSelecionada] = useState('produzir');

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
      </nav>

      <div className={styles.conteudo}>
        {renderizarComponente()}
      </div>
    </div>
  );
}
