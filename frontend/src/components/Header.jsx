import '../styles/Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
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
