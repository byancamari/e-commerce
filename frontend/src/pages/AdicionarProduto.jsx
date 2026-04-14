import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCarrinho } from '../contexts/CarrinhoContext';

export default function AdicionarProduto() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { adicionarItem } = useCarrinho();
  const [busca, setBusca] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [produtosEncontrados, setProdutosEncontrados] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Se veio de ProdutoDetalhes com produto pré-selecionado
  useEffect(() => {
    const produtoId = searchParams.get('id');
    const produtoNome = searchParams.get('nome');
    const produtoCategoria = searchParams.get('categoria');
    
    if (produtoId && produtoNome) {
      setProdutoSelecionado({
        id_produto: produtoId,
        nome_produto: produtoNome,
        categoria_produto: produtoCategoria || 'sem_categoria'
      });
      setBusca(produtoNome);
    }
  }, [searchParams]);

  // Buscar produtos enquanto o usuário digita
  useEffect(() => {
    if (busca.trim().length > 0) {
      buscarProdutos();
    } else {
      setProdutosEncontrados([]);
    }
  }, [busca]);

  const buscarProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/produtos?nome=${busca}&limit=50`);
      
      // Remove duplicatas por id_produto (camada extra de proteção)
      const produtosMap = new Map();
      if (Array.isArray(response.data)) {
        response.data.forEach(p => {
          if (!produtosMap.has(p.id_produto)) {
            produtosMap.set(p.id_produto, p);
          }
        });
      }
      
      const produtosUnicos = Array.from(produtosMap.values());
      setProdutosEncontrados(produtosUnicos);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setProdutosEncontrados([]);
    } finally {
      setLoading(false);
    }
  };

  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setBusca(produto.nome_produto); // Mostrar o nome selecionado
    setProdutosEncontrados([]); // Fechar a lista
  };

  const handleAdicionar = async () => {
    if (!produtoSelecionado) {
      setErro('Selecione um produto da lista');
      return;
    }

    if (quantidade < 1) {
      setErro('Quantidade deve ser pelo menos 1');
      return;
    }

    try {
      // Usar contexto para adicionar
      adicionarItem(
        produtoSelecionado.id_produto,
        produtoSelecionado.nome_produto,
        produtoSelecionado.categoria_produto,
        quantidade,
        produtoSelecionado.preco_produto || 0
      );
      
      alert(`✅ ${quantidade}x "${produtoSelecionado.nome_produto}" adicionado ao carrinho!`);
      navigate('/');
    } catch (err) {
      setErro('Erro ao adicionar ao carrinho');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto min-h-screen">
      <Link to="/" className="text-blue-500 font-bold hover:underline mb-8 inline-block">
        ← Voltar
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
        <h1 className="text-3xl font-extrabold !text-black mb-8">🛒 Adicionar ao Carrinho</h1>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">❌ {erro}</p>
          </div>
        )}

        {/* BUSCAR PRODUTO */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-black font-bold mb-2">
              🔍 Buscar Produto
            </label>
            <div className="relative">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o nome do produto..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-4 focus:ring-blue-400 outline-none transition"
              />
              
              {/* DROPDOWN COM RESULTADOS */}
              {produtosEncontrados.length > 0 && !produtoSelecionado && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-xl z-10 max-h-72 overflow-y-auto">
                  <div className="bg-blue-100 p-2 border-b border-blue-300 sticky top-0">
                    <p className="text-xs font-bold text-blue-900">
                      {produtosEncontrados.length} produto(s) encontrado(s) - Clique para selecionar
                    </p>
                  </div>
                  {produtosEncontrados.map((p, idx) => (
                    <div
                      key={`${p.id_produto}-${idx}`}
                      onClick={() => selecionarProduto(p)}
                      className="p-4 border-b border-slate-200 hover:bg-blue-100 cursor-pointer transition"
                    >
                      <p className="font-bold text-black text-base">{p.nome_produto}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-slate-600">
                          📂 {p.categoria_produto.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs font-bold text-green-600">
                          R$ {(p.preco_produto || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loading && busca && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg p-3 text-center text-slate-600">
                  ⏳ Buscando...
                </div>
              )}
            </div>
          </div>

          {/* PRODUTO SELECIONADO */}
          {produtoSelecionado && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-green-700 mb-1">✅ PRODUTO SELECIONADO</p>
                  <p className="font-bold text-black text-xl">{produtoSelecionado.nome_produto}</p>
                  <p className="text-sm text-slate-600">
                    📂 {produtoSelecionado.categoria_produto.replace(/_/g, ' ')}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    R$ {(produtoSelecionado.preco_produto || 0).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProdutoSelecionado(null);
                    setBusca('');
                    setProdutosEncontrados([]);
                  }}
                  className="px-3 py-1 bg-slate-300 text-black text-sm font-bold rounded hover:bg-slate-400 transition"
                >
                  🔄 Trocar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* QUANTIDADE */}
        {produtoSelecionado && (
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-black font-bold mb-2">
                📦 Quantidade a Adicionar
              </label>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="flex-1 p-2 border-2 border-slate-300 rounded-lg text-center text-lg font-bold text-black"
                />
                <button
                  onClick={() => setQuantidade(quantidade + 1)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Total: {quantidade}× @ R$ {(produtoSelecionado.preco_produto || 0).toFixed(2)} = 
                <span className="font-bold text-black ml-1">
                  R$ {(quantidade * (produtoSelecionado.preco_produto || 0)).toFixed(2)}
                </span>
              </p>
            </div>

            {/* BOTÃO ADICIONAR */}
            <button
              onClick={handleAdicionar}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition duration-200 transform hover:scale-105"
            >
              ✅ Adicionar {quantidade}x ao Carrinho
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-2 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700 transition"
            >
              ❌ Cancelar
            </button>
          </div>
        )}

        {/* INSTRUÇÃO */}
        {!produtoSelecionado && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-center">
            <p className="text-yellow-800 text-base font-bold">
              🔍 Digite para Buscar → 👆 Clique no Produto → 📦 Digite Quantidade → ✅ Adicionar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
