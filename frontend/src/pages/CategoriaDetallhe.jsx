import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function CategoriaDetalhes() {
  // Pega o nome da categoria lá da URL do navegador
  const { nomeCategoria } = useParams();
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // Busca um lote grande de produtos e filtra no frontend pela categoria escolhida
    setLoading(true);
    api.get(`/produtos?limit=500`)
      .then(res => {
        const produtosFiltrados = res.data.filter(p => p.categoria_produto === nomeCategoria);
        setProdutos(produtosFiltrados);
        setErro(null);
      })
      .catch(err => {
        console.error("Erro ao buscar os itens:", err);
        setErro('Erro ao carregar produtos. Tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [nomeCategoria]);

  // Filtra produtos pela busca
  const produtosFiltrados = produtos.filter(p =>
    p.nome_produto.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen">
        <p className="text-center text-lg">⏳ Carregando produtos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{erro}</p>
        </div>
        <Link to="/" className="text-blue-500 font-bold hover:underline">
          ← Voltar para Departamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <Link to="/" className="text-blue-500 font-bold hover:underline mb-8 inline-block">
        ← Voltar para Departamentos
      </Link>

      <h1 className="text-4xl font-extrabold !text-black mb-8 uppercase border-b pb-4">
        {nomeCategoria.replace(/_/g, ' ')}
      </h1>

      {/* BARRA DE BUSCA */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="🔍 Buscar produto nesta categoria..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-300 shadow-sm focus:ring-4 focus:ring-blue-400 outline-none text-slate-700 transition-all"
        />
      </div>

      {produtosFiltrados.length === 0 ? (
        <p className="text-slate-500 text-lg text-center py-12">
          {busca ? 'Nenhum produto encontrado com esse nome.' : 'Nenhum produto encontrado nesta categoria.'}
        </p>
      ) : (
        <div>
          <p className="text-slate-600 mb-6 font-semibold">Mostrando {produtosFiltrados.length} produto(s)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtosFiltrados.map(p => (
              <Link
                key={p.id_produto}
                to={`/produto/${p.id_produto}`}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <h2 className="!text-black font-bold h-12 line-clamp-2 group-hover:text-purple-600">{p.nome_produto}</h2>
                <div className="mt-4 pt-4 border-t border-slate-50 text-sm text-slate-500">
                  <p>ID: {p.id_produto.substring(0, 8)}</p>
                  <p className="text-blue-600 font-semibold group-hover:text-blue-700">Ver detalhes →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}