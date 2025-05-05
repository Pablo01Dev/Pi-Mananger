import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListaImoveis from './pages/ListaImoveis';
import Header from './components/Header';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <div className="main">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<ListaImoveis />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
