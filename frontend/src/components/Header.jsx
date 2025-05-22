import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>Pi Mananger</h1>
      </div>
      <nav>
        <ul>
          <li><a href="/imoveis">Imoveis</a></li>
          <li><a href="/placas">Placas</a></li>
        </ul>
      </nav>
    </header>
  );
}
