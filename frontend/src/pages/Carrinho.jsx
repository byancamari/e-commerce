import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCarrinho } from '../contexts/CarrinhoContext';
import api from '../services/api';

export default function Carrinho() {
  const navigate = useNavigate();
  const { carrinho, removerItem, atualizarQuantidade, limparCarrinho } = useCarrinho();
  const [processando, setProcessando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [editarDados, setEditarDados] = useState({});

  const total = carrinho.reduce((sum, item) => sum + (item.quantidade * (item.preco || 0)), 0);

  const iniciarEdicao = (item) => {
    setEditandoId(item.id_produto);
    setEditarDados({
      nome_produto: item.nome_produto,
      categoria_produto: item.categoria_produto
    });
  };

  const salvarEdicao = (id_produto) => {
    const itemIndex = carrinho.findIndex(item => item.id_produto === id_produto);
    if (itemIndex >= 0) {
      const novoCarrinho = [...carrinho];
      novoCarrinho[itemIndex] = {
        ...novoCarrinho[itemIndex],
        nome_produto: editarDados.nome_produto,
        categoria_produto: editarDados.categoria_produto
      };
      localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
      setEditandoId(null);
      window.location.reload(); // Recarregar para refletir mudanças
    }
  };

  const handleFinalizarPedido = async () => {
    if (carrinho.length === 0) {
      alert('❌ Carrinho vazio!');
      return;
    }

    // Pedir ID do consumidor (pode ser um email ou CPF)
    const idConsumidor = prompt('📋 Digite o ID do consumidor (ou email):');
    if (!idConsumidor) {
      alert('❌ Cancelado! ID do consumidor é obrigatório.');
      return;
    }

    try {
      setProcessando(true);
      
      // Preparar itens no formato esperado pelo backend
      const itens = carrinho.map(item => ({
        id_produto: item.id_produto,
        quantidade: item.quantidade
      }));

      // Chamar o backend para criar pedido
      const response = await api.post(
        '/pedidos',
        null,
        {
          params: {
            id_consumidor: idConsumidor,
            itens_data: JSON.stringify(itens)
          }
        }
      );

      const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
      alert(
        `✅ Pedido realizado com sucesso!\n\n` +
        `ID do Pedido: ${response.data.id_pedido}\n` +
        `Itens: ${totalItens}\n` +
        `Total: R$ ${total.toFixed(2)}`
      );
      
      limparCarrinho();
      navigate('/');
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      const mensagem = err.response?.data?.detail || 'Erro desconhecido';
      alert(`❌ Erro ao finalizar pedido:\n${mensagem}`);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-100">
      <Link to="/" className="text-blue-500 font-bold hover:underline mb-8 inline-block">
        ← Voltar
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
        <h1 className="text-3xl font-extrabold !text-black mb-8">🛒 Meu Carrinho</h1>

        {carrinho.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-slate-600 mb-6">Seu carrinho está vazio</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              🛍️ Continuar Comprando
            </Link>
          </div>
        ) : (
          <>
            {/* LISTA DE PRODUTOS */}
            <div className="space-y-4 mb-8">
              {carrinho.map(item => (
                <div
                  key={item.id_produto}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition"
                >
                  {editandoId === item.id_produto ? (
                    // MODO EDIÇÃO
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={editarDados.nome_produto}
                          onChange={(e) => setEditarDados({ ...editarDados, nome_produto: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                        <input
                          type="text"
                          value={editarDados.categoria_produto}
                          onChange={(e) => setEditarDados({ ...editarDados, categoria_produto: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => salvarEdicao(item.id_produto)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700"
                        >
                          ✅ Salvar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="px-3 py-1 bg-slate-400 text-white rounded text-sm font-bold hover:bg-slate-500"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // MODO VISUALIZAÇÃO
                    <>
                      <div className="flex-1">
                        <h3 className="font-bold text-black text-lg">{item.nome_produto}</h3>
                        <p className="text-sm text-slate-600">
                          📂 {item.categoria_produto?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Valor: R$ {(item.preco || 0).toFixed(2)}
                        </p>
                      </div>

                      {/* QUANTIDADE */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => atualizarQuantidade(item.id_produto, item.quantidade - 1)}
                          className="px-2 py-1 bg-slate-300 rounded font-bold hover:bg-slate-400 transition"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) => atualizarQuantidade(item.id_produto, Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                          className="w-16 p-1 border border-slate-300 rounded text-center font-bold text-black"
                        />
                        <button
                          onClick={() => atualizarQuantidade(item.id_produto, item.quantidade + 1)}
                          className="px-2 py-1 bg-slate-300 rounded font-bold hover:bg-slate-400 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* AÇÕES */}
                      <div className="text-right min-w-fit space-y-2">
                        <p className="font-bold text-black text-lg">
                          R$ {(item.quantidade * (item.preco || 0)).toFixed(2)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicao(item)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => removerItem(item.id_produto)}
                            className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded hover:bg-red-700 transition"
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* RESUMO */}
            <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-300">
              <div className="flex justify-between items-center mb-4">
                <p className="text-black font-bold text-lg">Total de itens:</p>
                <p className="text-black font-bold text-lg">
                  {carrinho.reduce((sum, item) => sum + item.quantidade, 0)}
                </p>
              </div>
              <div className="flex justify-between items-center border-t border-slate-300 pt-4">
                <p className="text-black font-bold text-xl">Valor Total:</p>
                <p className="text-black font-bold text-xl">
                  R$ {total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3">
              <button
                onClick={handleFinalizarPedido}
                disabled={processando}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {processando ? '⏳ Processando...' : '✅ Finalizar Compra'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition"
              >
                🛍️ Continuar Comprando
              </button>
              <button
                onClick={limparCarrinho}
                className="px-6 py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
              >
                🗑️ Limpar Tudo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
