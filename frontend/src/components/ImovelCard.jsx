import api from './api';

async function buscarImoveis() {
  try {
    const resposta = await api.get('/api/imoveis');
    console.log(resposta.data);
  } catch (erro) {
    console.error('Erro ao buscar imóveis:', erro);
  }
}
