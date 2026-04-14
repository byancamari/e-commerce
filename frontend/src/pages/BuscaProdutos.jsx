import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BuscaProdutos() {
  const [busca, setBusca] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busca.trim()) return;

    try {
      setLoading(true);
      const response = await api.get(`/produtos?nome=${busca}&limit=100`);
      
      // Remove duplicatas por id_produto
      const produtosMap = new Map();
      if (Array.isArray(response.data)) {
        response.data.forEach(p => {
          if (!produtosMap.has(p.id_produto)) {
            produtosMap.set(p.id_produto, p);
          }
        });
      }
      
      setProdutos(Array.from(produtosMap.values()));
      setBuscaFeita(true);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setProdutos([]);
      setBuscaFeita(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <Link to="/" className="text-blue-500 font-bold hover:underline mb-8 inline-block">
        ← Voltar para Departamentos
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold !text-black mb-8">🔍 Buscar Produtos</h1>
        
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Digite o nome do produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 p-4 rounded-xl border border-slate-300 shadow-sm focus:ring-4 focus:ring-blue-400 outline-none text-slate-700 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '⏳ Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-lg text-slate-600">⏳ Buscando produtos...</p>
        </div>
      )}

      {buscaFeita && !loading && (
        <div>
          {produtos.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 text-lg font-semibold">
                ℹ️ Nenhum produto encontrado com "{busca}"
              </p>
              <p className="text-yellow-700 text-sm mt-2">Tente buscar por outro termo</p>
            </div>
          ) : (
            <div>
              <p className="text-slate-600 mb-6 font-semibold text-lg">
                Encontrados <span className="text-blue-600 font-bold">{produtos.length}</span> produto(s)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {produtos.map(p => (
                  <Link
                    key={p.id_produto}
                    to={`/produto/${p.id_produto}`}
                    className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <h3 className="!text-black font-bold h-16 line-clamp-3 group-hover:text-blue-600 mb-2">
                      {p.nome_produto}
                    </h3>
                    <div className="pt-3 border-t border-slate-200 text-sm text-slate-600">
                      <p className="mb-2">📂 {p.categoria_produto.replace(/_/g, ' ')}</p>
                      <p className="text-blue-600 font-semibold group-hover:text-blue-700">
                        Ver detalhes →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
