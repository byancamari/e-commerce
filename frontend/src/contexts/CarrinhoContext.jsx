import { createContext, useContext, useState, useEffect } from 'react';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);

  // Carregar do localStorage ao montar
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo));
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }, [carrinho]);

  const adicionarItem = (id_produto, nome_produto, categoria_produto, quantidade = 1, preco = 0) => {
    const index = carrinho.findIndex(item => item.id_produto === id_produto);
    
    if (index >= 0) {
      // Aumentar quantidade se já existe
      const novoCarrinho = [...carrinho];
      novoCarrinho[index].quantidade += quantidade;
      setCarrinho(novoCarrinho);
    } else {
      // Adicionar novo item
      setCarrinho([...carrinho, {
        id_produto,
        nome_produto,
        categoria_produto,
        quantidade,
        preco
      }]);
    }
  };

  const removerItem = (id_produto) => {
    setCarrinho(carrinho.filter(item => item.id_produto !== id_produto));
  };

  const atualizarQuantidade = (id_produto, quantidade) => {
    if (quantidade < 1) {
      removerItem(id_produto);
      return;
    }
    
    const novoCarrinho = carrinho.map(item =>
      item.id_produto === id_produto ? { ...item, quantidade } : item
    );
    setCarrinho(novoCarrinho);
  };

  const limparCarrinho = () => {
    setCarrinho([]);
  };

  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{
      carrinho,
      adicionarItem,
      removerItem,
      atualizarQuantidade,
      limparCarrinho,
      totalItens
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider');
  }
  return context;
}
