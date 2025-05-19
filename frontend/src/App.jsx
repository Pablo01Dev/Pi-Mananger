import { Routes, Route } from 'react-router-dom';
import Imoveis from './pages/Imoveis';
import Placas from './pages/Placas'
import Header from './components/Header';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <div className="main">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Imoveis />} />
            <Route path="/imoveis" element={<Imoveis />} />
            <Route path="/placas" element={<Placas />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
