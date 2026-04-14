import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ProdutoDetalhes() {
  const { idProduto } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProduto();
  }, [idProduto]);

  const fetchProduto = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/produtos/${idProduto}`);
      setProduto(response.data);
      setFormData(response.data);
      setErro(null);
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      setErro('Não consegui carregar os detalhes do produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await api.delete(`/produtos/${idProduto}`);
        alert('Produto deletado com sucesso!');
        navigate('/');
      } catch (err) {
        alert('Erro ao deletar produto: ' + err.message);
      }
    }
  };

  const handleSalvar = async () => {
    try {
      setLoading(true);
      const dados = {
        nome_produto: formData.nome_produto || produto.nome_produto,
        categoria_produto: formData.categoria_produto || produto.categoria_produto,
        peso_produto_gramas: formData.peso_produto_gramas ? parseFloat(formData.peso_produto_gramas) : null,
        altura_centimetros: formData.altura_centimetros ? parseFloat(formData.altura_centimetros) : null,
        comprimento_centimetros: formData.comprimento_centimetros ? parseFloat(formData.comprimento_centimetros) : null,
        largura_centimetros: formData.largura_centimetros ? parseFloat(formData.largura_centimetros) : null
      };

      await api.put(`/produtos/${idProduto}`, null, { params: dados });
      alert('✅ Produto atualizado com sucesso!');
      setEditando(false);
      fetchProduto(); // Recarrega os dados
    } catch (err) {
      alert('Erro ao atualizar produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-center text-lg">⏳ Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{erro}</p>
        </div>
        <Link to="/" className="text-blue-500 font-bold hover:underline">
          ← Voltar
        </Link>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-center">Produto não encontrado.</p>
        <Link to="/" className="text-blue-500 font-bold hover:underline">
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <Link to="/" className="text-blue-500 font-bold hover:underline mb-6 inline-block">
        ← Voltar para Departamentos
      </Link>

      {/* HEADER COM TÍTULO E AÇÕES */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold !text-black">{produto.nome_produto}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setEditando(!editando)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {editando ? '❌ Cancelar' : '✏️ Editar'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            🗑️ Deletar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA - INFORMAÇÕES PRINCIPAIS */}
        <div className="lg:col-span-2 space-y-6">
          {/* INFO GERAL */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h2 className="text-2xl font-bold !text-black mb-4">Informações do Produto</h2>
            
            {editando ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">Nome</label>
                  <input
                    type="text"
                    name="nome_produto"
                    value={formData.nome_produto || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">Categoria</label>
                  <input
                    type="text"
                    name="categoria_produto"
                    value={formData.categoria_produto || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  onClick={handleSalvar}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  💾 Salvar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-700">
                  <strong>ID:</strong> {produto.id_produto.substring(0, 12)}...
                </p>
                <p className="text-slate-700">
                  <strong>Categoria:</strong> {produto.categoria_produto.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>
            )}
          </div>

          {/* DIMENSÕES */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h2 className="text-2xl font-bold !text-black mb-4">📏 Dimensões e Peso</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-600 text-sm font-semibold">Peso</p>
                <p className="text-lg font-bold text-slate-900">
                  {produto.peso_produto_gramas ? `${produto.peso_produto_gramas}g` : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-600 text-sm font-semibold">Altura</p>
                <p className="text-lg font-bold text-slate-900">
                  {produto.altura_centimetros ? `${produto.altura_centimetros}cm` : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-600 text-sm font-semibold">Comprimento</p>
                <p className="text-lg font-bold text-slate-900">
                  {produto.comprimento_centimetros ? `${produto.comprimento_centimetros}cm` : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-600 text-sm font-semibold">Largura</p>
                <p className="text-lg font-bold text-slate-900">
                  {produto.largura_centimetros ? `${produto.largura_centimetros}cm` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* AVALIAÇÕES */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h2 className="text-2xl font-bold !text-black mb-4">⭐ Avaliações ({produto.total_avaliacoes})</h2>
            
            {produto.total_avaliacoes === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhuma avaliação ainda.</p>
            ) : (
              <div className="space-y-4">
                {produto.avaliacoes && produto.avaliacoes.map((aval, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < aval.nota ? 'text-yellow-400' : 'text-slate-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{new Date(aval.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="font-semibold text-slate-900">{aval.titulo}</p>
                    <p className="text-slate-700 text-sm mt-2">{aval.comentario}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA - RESUMO */}
        <div className="space-y-6">
          {/* CARD DE ESTATÍSTICAS */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
            <h3 className="text-xl font-bold !text-black mb-4">📊 Estatísticas</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-slate-600 text-sm font-semibold">Média de Avaliações</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-bold text-blue-600">{produto.media_avaliacoes}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(produto.media_avaliacoes) ? 'text-yellow-400 text-xl' : 'text-slate-300 text-xl'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-slate-600 text-sm font-semibold">Total de Vendas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{produto.total_vendas}</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="text-slate-600 text-sm font-semibold">Total de Avaliações</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{produto.total_avaliacoes}</p>
              </div>
            </div>
          </div>

          {/* GRÁFICO DE DESEMPENHO */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-xl font-bold !text-black mb-4">📈 Desempenho de Vendas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { mes: 'Jan', vendas: Math.floor(produto.total_vendas * 0.1) },
                { mes: 'Fev', vendas: Math.floor(produto.total_vendas * 0.15) },
                { mes: 'Mar', vendas: Math.floor(produto.total_vendas * 0.12) },
                { mes: 'Abr', vendas: Math.floor(produto.total_vendas * 0.2) },
                { mes: 'Mai', vendas: Math.floor(produto.total_vendas * 0.18) },
                { mes: 'Jun', vendas: Math.floor(produto.total_vendas * 0.25) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vendas" fill="#3b82f6" name="Unidades Vendidas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DISTRIBUIÇÃO DE AVALIAÇÕES */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-xl font-bold !text-black mb-4">⭐ Distribuição de Notas</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: '5⭐', value: Math.floor(produto.total_avaliacoes * 0.5) },
                    { name: '4⭐', value: Math.floor(produto.total_avaliacoes * 0.25) },
                    { name: '3⭐', value: Math.floor(produto.total_avaliacoes * 0.15) },
                    { name: '2⭐', value: Math.floor(produto.total_avaliacoes * 0.07) },
                    { name: '1⭐', value: Math.floor(produto.total_avaliacoes * 0.03) }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#fbbf24" />
                  <Cell fill="#60a5fa" />
                  <Cell fill="#34d399" />
                  <Cell fill="#f87171" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* AÇÕES RÁPIDAS */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-xl font-bold !text-black mb-4">⚡ Ações</h3>
            <div className="space-y-2">
              <Link
                to={`/adicionar?id=${produto.id_produto}&nome=${encodeURIComponent(produto.nome_produto)}&categoria=${produto.categoria_produto}`}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition inline-block text-center font-bold"
              >
                🛒 Adicionar ao Carrinho
              </Link>
              <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                ♥️ Adicionar aos Favoritos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
