import { Link } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  return (
    <div className={styles.sideBar}>
      <h2>Painel Admin</h2>
      <nav>
        <ul>
          <li><Link to="/">Novo Imóvel</Link></li>
          <li><Link to="/imoveis">Lista de Imóveis</Link></li>
        </ul>
      </nav>
    </div>
  );
}
