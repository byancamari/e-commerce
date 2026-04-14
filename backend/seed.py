import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
import os

def seed():
    db: Session = SessionLocal()
    print("========== INICIANDO SEED.PY ==========")
    
    data_path = "dados"

    try:
        from app.database import Base, engine

        print("🧨 Resetando banco...")

        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # --- PASSO 1: CONSUMIDORES ---
        print("\n📥 Lendo dim_consumidores.csv...")
        df_cons = pd.read_csv(os.path.join(data_path, "dim_consumidores.csv"))
        # Remove consumidores duplicados
        df_cons = df_cons.drop_duplicates(subset=['id_consumidor'], keep='first')
        
        for _, row in df_cons.iterrows():
            c = models.Consumidor(
                id_consumidor=row['id_consumidor'],
                prefixo_cep=str(row['prefixo_cep']),
                nome_consumidor=row['nome_consumidor'],
                cidade=row['cidade'],
                estado=row['estado']
            )
            db.add(c)
        db.commit()
        print(f"✅ {len(df_cons)} consumidores inseridos com sucesso!")

        # --- PASSO 2: VENDEDORES ---
        print("\n📥 Lendo dim_vendedores.csv...")
        df_vend = pd.read_csv(os.path.join(data_path, "dim_vendedores.csv"))
        # Remove vendedores duplicados
        df_vend = df_vend.drop_duplicates(subset=['id_vendedor'], keep='first')
        
        for _, row in df_vend.iterrows():
            v = models.Vendedor(
                id_vendedor=row['id_vendedor'],
                nome_vendedor=row['nome_vendedor'],
                prefixo_cep=str(row['prefixo_cep']),
                cidade=row['cidade'],
                estado=row['estado']
            )
            db.add(v)
        db.commit()
        print(f"✅ {len(df_vend)} vendedores inseridos com sucesso!")

        # --- PASSO 3: PRODUTOS ---
        print("\n📥 Lendo dim_produtos.csv...")
        df_prod = pd.read_csv(os.path.join(data_path, "dim_produtos.csv"))
        # Remove produtos duplicados
        df_prod = df_prod.drop_duplicates(subset=['id_produto'], keep='first')
        
        import random
        for _, row in df_prod.iterrows():
            # Gerar preço aleatório entre 10 e 500 reais
            preco = round(random.uniform(10, 500), 2)
            
            p = models.Produto(
                id_produto=row['id_produto'],
                nome_produto=row['nome_produto'],
                categoria_produto=row['categoria_produto'] if pd.notnull(row['categoria_produto']) else "sem_categoria",
                preco_produto=preco,
                peso_produto_gramas=row['peso_produto_gramas'] if pd.notnull(row['peso_produto_gramas']) else None,
                comprimento_centimetros=row['comprimento_centimetros'] if pd.notnull(row['comprimento_centimetros']) else None,
                altura_centimetros=row['altura_centimetros'] if pd.notnull(row['altura_centimetros']) else None,
                largura_centimetros=row['largura_centimetros'] if pd.notnull(row['largura_centimetros']) else None
            )
            db.add(p)
        db.commit()
        print(f"✅ {len(df_prod)} produtos inseridos com sucesso!")

        # --- PASSO 4: PEDIDOS ---
        print("\n📥 Lendo fat_pedidos.csv...")
        df_pedidos = pd.read_csv(os.path.join(data_path, "fat_pedidos.csv"))
        # Remove pedidos duplicados
        df_pedidos = df_pedidos.drop_duplicates(subset=['id_pedido'], keep='first')
        
        for _, row in df_pedidos.iterrows():
            ped = models.Pedido(
                id_pedido=row['id_pedido'],
                id_consumidor=row['id_consumidor'],
                status=row['status'],
                pedido_compra_timestamp=pd.to_datetime(row['pedido_compra_timestamp']) if pd.notnull(row['pedido_compra_timestamp']) else None,
                pedido_entregue_timestamp=pd.to_datetime(row['pedido_entregue_timestamp']) if pd.notnull(row['pedido_entregue_timestamp']) else None,
                data_estimada_entrega=pd.to_datetime(row['data_estimada_entrega']).date() if pd.notnull(row['data_estimada_entrega']) else None,
                tempo_entrega_dias=row['tempo_entrega_dias'] if pd.notnull(row['tempo_entrega_dias']) else None,
                tempo_entrega_estimado_dias=row['tempo_entrega_estimado_dias'] if pd.notnull(row['tempo_entrega_estimado_dias']) else None,
                diferenca_entrega_dias=row['diferenca_entrega_dias'] if pd.notnull(row['diferenca_entrega_dias']) else None,
                entrega_no_prazo=row['entrega_no_prazo'] if pd.notnull(row['entrega_no_prazo']) else None
            )
            db.add(ped)
        db.commit()
        print(f"✅ {len(df_pedidos)} pedidos inseridos com sucesso!")

        # --- PASSO 5: ITENS DE PEDIDO ---
        print("\n📥 Lendo fat_itens_pedidos.csv...")
        df_itens = pd.read_csv(os.path.join(data_path, "fat_itens_pedidos.csv"))
        # Remove itens duplicados dentro do mesmo pedido (garante chave composta única)
        df_itens = df_itens.drop_duplicates(subset=['id_pedido', 'id_item'], keep='first')
        
        for _, row in df_itens.iterrows():
            item = models.ItemPedido(
                id_pedido=row['id_pedido'],
                id_item=int(row['id_item']),
                id_produto=row['id_produto'],
                id_vendedor=row['id_vendedor'],
                preco_BRL=row['preco_BRL'],
                preco_frete=row['preco_frete']
            )
            db.add(item)
        db.commit()
        print(f"✅ {len(df_itens)} itens de pedidos inseridos com sucesso!")

        # --- PASSO 6: AVALIAÇÕES ---
        print("\n📥 Lendo fat_avaliacoes_pedidos.csv...")
        df_aval = pd.read_csv(os.path.join(data_path, "fat_avaliacoes_pedidos.csv"))
        # Remove avaliações duplicadas para evitar o sqlite3.IntegrityError
        df_aval = df_aval.drop_duplicates(subset=['id_avaliacao'], keep='first')
        
        for _, row in df_aval.iterrows():
            aval = models.AvaliacaoPedido(
                id_avaliacao=row['id_avaliacao'],
                id_pedido=row['id_pedido'],
                avaliacao=int(row['avaliacao']),
                titulo_comentario=row['titulo_comentario'] if pd.notnull(row['titulo_comentario']) else None,
                comentario=row['comentario'] if pd.notnull(row['comentario']) else None,
                data_comentario=pd.to_datetime(row['data_comentario']) if pd.notnull(row['data_comentario']) else None,
                data_resposta=pd.to_datetime(row['data_resposta']) if pd.notnull(row['data_resposta']) else None
            )
            db.add(aval)
        db.commit()
        print(f"✅ {len(df_aval)} avaliações inseridas com sucesso!")

        print("\n🎉 PARABÉNS! O banco de dados foi populado com sucesso.")

    except Exception as e:
        print(f"\n❌ ERRO DURANTE A IMPORTAÇÃO: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    sys.path.append(os.getcwd())
    seed()