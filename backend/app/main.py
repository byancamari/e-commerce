from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

# Importações internas
from . import models, database, schemas 

app = FastAPI(
    title="Sistema de Compras Online",
    description="API para gerenciamento de pedidos, produtos, consumidores e vendedores.",
    version="1.0.0",
)

# ✅ CONFIGURAÇÃO DE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependência do Banco de Dados
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API rodando com sucesso!"}

# --- ROTAS DE PRODUTOS ---

@app.get("/produtos", tags=["Produtos"])
def listar_produtos(nome: Optional[str] = None, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """ Retorna lista de produtos com filtro de nome opcional (sem duplicatas) """
    query = db.query(models.Produto)
    
    if nome:
        query = query.filter(models.Produto.nome_produto.ilike(f"%{nome}%"))
    
    # ORDER BY para ter consistência e depois remover duplicatas
    query = query.order_by(models.Produto.id_produto).distinct(models.Produto.id_produto)
    
    return query.offset(skip).limit(limit).all()

@app.get("/produtos/{id_produto}", tags=["Produtos"])
def obter_produto_detalhado(id_produto: str, db: Session = Depends(get_db)):
    """ Busca detalhes do produto, calcula média de avaliações e número de vendas """
    produto = db.query(models.Produto).filter(models.Produto.id_produto == id_produto).first()
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # Cálculo da média de avaliações e contagem
    media = db.query(func.avg(models.AvaliacaoPedido.avaliacao)).filter(
        models.AvaliacaoPedido.id_pedido.in_(
            db.query(models.ItemPedido.id_pedido).filter(models.ItemPedido.id_produto == id_produto)
        )
    ).scalar()
    
    total_avaliacoes = db.query(func.count(models.AvaliacaoPedido.id_avaliacao)).filter(
        models.AvaliacaoPedido.id_pedido.in_(
            db.query(models.ItemPedido.id_pedido).filter(models.ItemPedido.id_produto == id_produto)
        )
    ).scalar()
    
    # Contagem de vendas (itens do produto vendidos)
    total_vendas = db.query(func.count(models.ItemPedido.id_item)).filter(
        models.ItemPedido.id_produto == id_produto
    ).scalar()
    
    # Buscar todas as avaliações para este produto
    avaliacoes = db.query(
        models.AvaliacaoPedido.avaliacao,
        models.AvaliacaoPedido.titulo_comentario,
        models.AvaliacaoPedido.comentario,
        models.AvaliacaoPedido.data_comentario
    ).filter(
        models.AvaliacaoPedido.id_pedido.in_(
            db.query(models.ItemPedido.id_pedido).filter(models.ItemPedido.id_produto == id_produto)
        )
    ).order_by(models.AvaliacaoPedido.data_comentario.desc()).limit(10).all()

    # Preparar resposta
    dados_produto = {
        "id_produto": produto.id_produto,
        "nome_produto": produto.nome_produto,
        "categoria_produto": produto.categoria_produto,
        "preco_produto": produto.preco_produto,
        "peso_produto_gramas": produto.peso_produto_gramas,
        "altura_centimetros": produto.altura_centimetros,
        "comprimento_centimetros": produto.comprimento_centimetros,
        "largura_centimetros": produto.largura_centimetros,
        "media_avaliacoes": round(media, 2) if media else 0,
        "total_avaliacoes": total_avaliacoes or 0,
        "total_vendas": total_vendas or 0,
        "avaliacoes": [
            {
                "nota": aval[0],
                "titulo": aval[1] or "Sem título",
                "comentario": aval[2] or "Sem comentário",
                "data": str(aval[3]) if aval[3] else None
            } for aval in avaliacoes
        ]
    }
    
    return dados_produto

# --- ROTAS DE CRIAÇÃO E ATUALIZAÇÃO ---

@app.post("/produtos", tags=["Produtos"])
def criar_produto(
    nome_produto: str,
    categoria_produto: str,
    preco_produto: float = 0.0,
    peso_produto_gramas: Optional[float] = None,
    altura_centimetros: Optional[float] = None,
    comprimento_centimetros: Optional[float] = None,
    largura_centimetros: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """ Cria um novo produto """
    import uuid
    
    novo_produto = models.Produto(
        id_produto=str(uuid.uuid4()),
        nome_produto=nome_produto,
        categoria_produto=categoria_produto,
        preco_produto=preco_produto,
        peso_produto_gramas=peso_produto_gramas,
        altura_centimetros=altura_centimetros,
        comprimento_centimetros=comprimento_centimetros,
        largura_centimetros=largura_centimetros
    )
    
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    
    return {
        "message": "Produto criado com sucesso!",
        "id_produto": novo_produto.id_produto,
        "nome_produto": novo_produto.nome_produto,
        "preco_produto": novo_produto.preco_produto,
        "categoria_produto": novo_produto.categoria_produto
    }

@app.put("/produtos/{id_produto}", tags=["Produtos"])
def atualizar_produto(
    id_produto: str,
    nome_produto: Optional[str] = None,
    categoria_produto: Optional[str] = None,
    preco_produto: Optional[float] = None,
    peso_produto_gramas: Optional[float] = None,
    altura_centimetros: Optional[float] = None,
    comprimento_centimetros: Optional[float] = None,
    largura_centimetros: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """ Atualiza um produto existente """
    produto = db.query(models.Produto).filter(models.Produto.id_produto == id_produto).first()
    
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    # Atualizar apenas os campos fornecidos
    if nome_produto:
        produto.nome_produto = nome_produto
    if categoria_produto:
        produto.categoria_produto = categoria_produto
    if preco_produto is not None:
        produto.preco_produto = preco_produto
    if peso_produto_gramas is not None:
        produto.peso_produto_gramas = peso_produto_gramas
    if altura_centimetros is not None:
        produto.altura_centimetros = altura_centimetros
    if comprimento_centimetros is not None:
        produto.comprimento_centimetros = comprimento_centimetros
    if largura_centimetros is not None:
        produto.largura_centimetros = largura_centimetros
    
    db.commit()
    db.refresh(produto)
    
    return {
        "message": "Produto atualizado com sucesso!",
        "id_produto": produto.id_produto,
        "nome_produto": produto.nome_produto,
        "preco_produto": produto.preco_produto,
        "categoria_produto": produto.categoria_produto
    }

# --- ROTAS CRUD ADICIONAIS ---

@app.delete("/produtos/{id_produto}", tags=["Produtos"])
def deletar_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(models.Produto).filter(models.Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(produto)
    db.commit()
    return {"message": "Produto removido com sucesso"}

# --- ROTAS DE PEDIDOS ---

@app.post("/pedidos", tags=["Pedidos"])
def criar_pedido(
    id_consumidor: str,
    itens_data: str,  # JSON string de itens: [{"id_produto": "...", "quantidade": 5}]
    db: Session = Depends(get_db)
):
    """ Cria um novo pedido com itens """
    import json
    import uuid
    from datetime import datetime
    
    try:
        itens = json.loads(itens_data)
    except:
        raise HTTPException(status_code=400, detail="itens_data deve ser JSON válido")
    
    if not itens or len(itens) == 0:
        raise HTTPException(status_code=400, detail="Pedido deve ter ao menos 1 item")
    
    # Verificar se consumidor existe
    consumidor = db.query(models.Consumidor).filter(
        models.Consumidor.id_consumidor == id_consumidor
    ).first()
    if not consumidor:
        raise HTTPException(status_code=404, detail="Consumidor não encontrado")
    
    try:
        # Criar pedido
        id_pedido = str(uuid.uuid4())
        novo_pedido = models.Pedido(
            id_pedido=id_pedido,
            id_consumidor=id_consumidor,
            status="pendente",
            pedido_compra_timestamp=datetime.now()
        )
        db.add(novo_pedido)
        db.flush()  # Flush para garantir que o pedido existe
        
        # Adicionar itens
        total_itens = 0
        for idx, item in enumerate(itens):
            id_produto = item.get("id_produto")
            quantidade = item.get("quantidade", 1)
            
            if not id_produto:
                raise HTTPException(status_code=400, detail=f"Item {idx} sem id_produto")
            
            # Buscar produto para pegar preço
            produto = db.query(models.Produto).filter(
                models.Produto.id_produto == id_produto
            ).first()
            
            if not produto:
                raise HTTPException(status_code=404, detail=f"Produto {id_produto} não encontrado")
            
            # Buscar um vendedor aleatório (para simplificar, pega o primeiro)
            vendedor = db.query(models.Vendedor).first()
            if not vendedor:
                raise HTTPException(status_code=400, detail="Nenhum vendedor disponível")
            
            # Criar item do pedido
            item_pedido = models.ItemPedido(
                id_pedido=id_pedido,
                id_item=idx + 1,
                id_produto=id_produto,
                id_vendedor=vendedor.id_vendedor,
                preco_BRL=produto.preco_produto * quantidade,
                preco_frete=0.0  # Frete grátis por enquanto
            )
            db.add(item_pedido)
            total_itens += quantidade
        
        db.commit()
        
        return {
            "message": "Pedido criado com sucesso!",
            "id_pedido": id_pedido,
            "id_consumidor": id_consumidor,
            "status": "pendente",
            "total_itens": total_itens,
            "data_pedido": novo_pedido.pedido_compra_timestamp
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar pedido: {str(e)}")

# Iniciar o servidor
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)