import { Routes, Route } from 'react-router-dom';
import NovoImovel from './pages/NovoImovel';
import ListaImoveis from './pages/ListaImoveis';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<NovoImovel />} />
            <Route path="/imoveis" element={<ListaImoveis />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
