import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIA_IMAGENS } from '../services/categorias';
import { useCarrinho } from '../contexts/CarrinhoContext';

export default function Home() {
  const [busca, setBusca] = useState('');
  const { totalItens } = useCarrinho();
  
  // Pega todos os nomes das categorias do nosso arquivo (sem repetir)
  const todasCategorias = Object.keys(CATEGORIA_IMAGENS);
  
  // Filtra as categorias caso o usuário digite na barra de busca
  const categoriasFiltradas = todasCategorias.filter(cat => 
    cat.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold !text-black mb-4">Departamentos 🚀</h1>
        
        {/* Barra Superior com Ações */}
        <div className="flex gap-3 mb-6 justify-center flex-wrap">
          <Link
            to="/buscar"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            🔍 Buscar Produtos
          </Link>
          <Link
            to="/adicionar"
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
          >
            ➕ Adicionar Produto
          </Link>
          <Link
            to="/carrinho"
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition relative"
          >
            🛒 Carrinho
            {totalItens > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalItens}
              </span>
            )}
          </Link>
        </div>

        <input 
          type="text"
          placeholder="Buscar departamento..."
          className="w-full max-w-2xl p-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-blue-400 outline-none text-slate-700 transition-all"
          onChange={(e) => setBusca(e.target.value)}
        />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categoriasFiltradas.map(categoria => (
          <div key={categoria} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            
            <div className="h-48 w-full bg-slate-200 relative overflow-hidden">
              <img 
                src={CATEGORIA_IMAGENS[categoria]} 
                alt={categoria}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="p-5 text-center">
                <h2 className="!text-black font-bold text-lg uppercase tracking-wider mb-4">
                {categoria.replace(/_/g, ' ')}
                </h2>
              
              {/* O Link do React Router funciona como uma tag <a>, mudando de página sem recarregar */}
              <Link 
                to={`/categoria/${categoria}`}
                className="inline-block w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-md"
              >
                Ver Detalhes
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}