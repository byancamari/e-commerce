#   E-Commerce Platform

Uma plataforma de e-commerce moderna e completa, desenvolvida com **FastAPI** (backend Python) e **React + Tailwind CSS** (frontend), com integração de banco de dados SQLite e análise de dados.

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Como Rodar](#como-rodar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)

---

## 👀 Visão Geral

RocketLab 2026 é uma plataforma de e-commerce responsiva que permite:
- **Browsing**: Navegar por categorias de produtos
- **Busca**: Buscar produtos por nome
- **Carrinho**: Adicionar/remover itens e editar quantidades
- **Checkout**: Finalizar pedidos com rastreamento
- **Análise**: Visualizar estatísticas e gráficos de vendas
- **Gerenciamento**: CRUD completo de produtos (admin)

---

## 🛠️ Tecnologias

### Backend
- **FastAPI 1.0.0** - Framework web rápido
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Pydantic** - Validação de dados
- **CORS** - Compartilhamento de recursos entre domínios
- **Alembic** - Migrações de banco de dados

### Frontend
- **React 19.2.4** - Biblioteca JS para UI
- **Vite 6.x** - Build tool rápido
- **React Router v7** - Roteamento SPA
- **Tailwind CSS v4** - Estilos CSS utilitários
- **Axios 1.15** - Cliente HTTP
- **Recharts 3.8** - Gráficos e visualizações

### Dados
- **Pandas** - Processamento de CSVs
- **UUID** - Geração de IDs únicos

---

## 📦 Requisitos

### Sistema
- Python 3.10+
- Node.js 18+ com pnpm (ou npm/yarn)
- Git

### Verificar instalação
```bash
# Python
python --version

# Node.js
node --version

# pnpm (recomendado)
pnpm --version
```

---

## 💾 Instalação

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/byancamari/e-commerce.git
cd e-commerce
```

### 2️⃣ Setup Backend (Python)

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
.venv\Scripts\activate

# Ativar (macOS/Linux)
source venv/bin/activate

# Instalar dependências
pip install -r backend/requirements.txt
```

### 3️⃣ Setup Frontend (Node.js)

```bash
cd frontend

# Instalar dependências
pnpm install

# (Ou use npm: npm install)
```

### 4️⃣ Popular Banco de Dados

```bash
# Voltar para raiz
cd ..

# Rodar seed (popula com ~33k produtos)
cd backend
python seed.py
```

⏳ **Aviso**: Este processo pode levar **3-5 minutos** pois insere muitos registros.

---

## 🚀 Como Rodar

### Opção A: Terminal Separado (Recomendado)

#### Terminal 1 - Backend
```bash
cd backend
.venv\Scripts\activate        # Windows
source venv/bin/activate      # macOS/Linux
python -m uvicorn app.main:app --reload
```

Acesse: **http://127.0.0.1:8000**  
Docs interativa: **http://127.0.0.1:8000/docs**

#### Terminal 2 - Frontend
```bash
cd frontend
pnpm dev
```

Acesse: **http://localhost:5173** (ou http://localhost:5175 se 5173 estiver em uso)

### Opção B: Usando VS Code

1. Abra VS Code
2. Terminal > New Terminal (ou Ctrl + `)
3. Abra outro terminal (Terminal > New Terminal)
4. Em um: `cd backend && python -m uvicorn app.main:app --reload`
5. No outro: `cd frontend && pnpm dev`

---

## 📂 Estrutura do Projeto

```
rocketlab2026/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # 🎯 Endpoints FastAPI
│   │   ├── config.py            # Configurações
│   │   ├── database.py          # Conexão SQLite
│   │   ├── models/              # Modelos SQLAlchemy
│   │   │   ├── produto.py
│   │   │   ├── pedido.py
│   │   │   ├── consumidor.py
│   │   │   └── ...
│   │   └── schemas/             # Schemas Pydantic
│   ├── alembic/                 # Migrações (opcional)
│   ├── dados/                   # CSVs para seed
│   │   ├── dim_produtos.csv
│   │   ├── dim_consumidores.csv
│   │   └── ...
│   ├── seed.py                  # Script de população
│   ├── requirements.txt         # Dependências Python
│   └── database.db              # 📊 Banco SQLite
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Router principal
│   │   ├── main.jsx             # Entry point
│   │   ├── contexts/            # Estados globais
│   │   │   └── CarrinhoContext.jsx
│   │   ├── pages/               # Páginas/Rotas
│   │   │   ├── Home.jsx         # Catálogo
│   │   │   ├── ProdutoDetalhes.jsx
│   │   │   ├── BuscaProdutos.jsx
│   │   │   ├── AdicionarProduto.jsx
│   │   │   └── Carrinho.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Axios config
│   │   │   └── categorias.js    # Imagens categorias
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js       # Tailwind v4
│   ├── postcss.config.js        # PostCSS config
│   ├── package.json
│   └── pnpm-lock.yaml
│
└── README.md
```

---

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Listagem de produtos por categoria
- [x] Busca global de produtos
- [x] Detalhes do produto com avaliações
- [x] Adicionar ao carrinho (com duplicate handling)
- [x] Carrinho completo (editar, remover, quantidade)
- [x] Checkout com criação de pedidos
- [x] CRUD de produtos (admin)
- [x] Gráficos de vendas (Recharts)
- [x] Preços em tempo real
- [x] Responsive design (mobile-friendly)

### 🔲 Pendentes
- [ ] Autenticação de usuários
- [ ] Sistema de favoritos
- [ ] Histórico de pedidos
- [ ] Upload de imagens
- [ ] Filtros avançados
- [ ] Paginação
- [ ] Testes automatizados
- [ ] Deploy em produção

---

## 🔌 API Endpoints

### Produtos

```http
GET /produtos
  - Query: ?nome=keyword&limit=20&skip=0
  Response: [{ id_produto, nome_produto, categoria_produto, preco_produto, ... }]

GET /produtos/{id_produto}
  Response: { id_produto, nome_produto, media_avaliacoes, total_vendas, avaliacoes: [...] }

POST /produtos
  Query: ?nome_produto=X&categoria_produto=Y&preco_produto=Z
  Response: { message, id_produto, nome_produto }

PUT /produtos/{id_produto}
  Query: ?nome_produto=X&categoria_produto=Y&...
  Response: { message, id_produto, nome_produto, categoria_produto }

DELETE /produtos/{id_produto}
  Response: { message }
```

### Pedidos

```http
POST /pedidos
  Query: ?id_consumidor=XXX&itens_data=JSON
  Exemplo: itens_data = '[{"id_produto":"123","quantidade":5}]'
  Response: { message, id_pedido, id_consumidor, status, total_itens, data_pedido }
```

---

## 📊 Dados de Exemplo

O seed inclui:
- **99.441** consumidores
- **3.095** vendedores
- **32.951** produtos (com preços aleatórios R$ 10-500)
- **Avaliações** calculadas dinamicamente

---

## 🔍 Testando a API

### Método 1: Swagger UI (Interativo)
```
1. Rode o backend
2. Acesse http://127.0.0.1:8000/docs
3. Teste os endpoints diretamente
```

### Método 2: cURL

```bash
# Buscar produtos
curl "http://127.0.0.1:8000/produtos?nome=samsung&limit=5"

# Criar pedido
curl -X POST "http://127.0.0.1:8000/pedidos?id_consumidor=123&itens_data=%5B%7B%22id_produto%22%3A%22456%22%2C%22quantidade%22%3A2%7D%5D"
```

### Método 3: Frontend (Recomendado)
1. Acesse http://localhost:5173
2. Navegue como usuário normal
3. Teste todas as funcionalidades

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: pydantic_settings"
```bash
cd backend
pip install pydantic-settings
```

### "Port 5173 already in use"
```bash
pnpm dev -- --port 5175
```

### "Database locked"
Abra uma nova terminal (outra tem a conexão ativa)

### Seed muito lento
É normal! Tá inserindo 135k+ registros. Deixa rodar.

---

## 📝 Notas de Desenvolvimento

### Frontend
- Usa **Context API** para estado global (carrinho)
- **Tailwind v4** requer `@import "tailwindcss"` no CSS
- Todas as páginas são **mobile-responsive**

### Backend
- Migrações via **Alembic** (init: `alembic init alembic`)
- Banco SQLite em `backend/database.db`
- CORS habilitado para conectar React

---

## 👨‍💻 Autor

A base desse projeto foi desenvolvido por **Gabriel Mota Pinha** para o projeto RocketLab 2026.

---


## 🤝 Suporte

Dúvidas? Verifique:
1. Este README
2. Docs da API: http://127.0.0.1:8000/docs
3. Console do navegador (Dev Tools: F12)
4. Logs do terminal
