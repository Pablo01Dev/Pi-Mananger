import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>Pi Mananger</h1>
      </div>
      <nav>
        <ul>
          <li>imóveis</li>
          <li>Placas</li>
          <li>Marketing</li>
          <li>Formulários</li>
        </ul>
      </nav>
    </header>
  );
}
