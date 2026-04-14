from pydantic import BaseModel
from typing import Optional

# Esquema para o Produto (o que a API vai enviar para o React)
class ProdutoBase(BaseModel):
    id_produto: str
    nome_produto: Optional[str] = None
    categoria_produto: Optional[str] = None
    preco_produto: Optional[float] = None

    class Config:
        from_attributes = True



