import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CarrinhoProvider } from './contexts/CarrinhoContext';
import Home from './pages/Home';
import CategoriaDetalhes from './pages/CategoriaDetallhe';
import ProdutoDetalhes from './pages/ProdutoDetalhes';
import BuscaProdutos from './pages/BuscaProdutos';
import AdicionarProduto from './pages/AdicionarProduto';
import Carrinho from './pages/Carrinho';

function App() {
  return (
    <BrowserRouter>
      <CarrinhoProvider>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categoria/:nomeCategoria" element={<CategoriaDetalhes />} />
            <Route path="/produto/:idProduto" element={<ProdutoDetalhes />} />
            <Route path="/buscar" element={<BuscaProdutos />} />
            <Route path="/adicionar" element={<AdicionarProduto />} />
            <Route path="/carrinho" element={<Carrinho />} />
          </Routes>
        </div>
      </CarrinhoProvider>
    </BrowserRouter>
  );
}

export default App;