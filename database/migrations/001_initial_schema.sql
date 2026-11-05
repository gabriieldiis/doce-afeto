-- ============================================
-- DOCE AFETO
-- 001 - Estrutura inicial do banco de dados
-- ============================================

-- 1. PRODUTOS
CREATE TABLE public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    custo DECIMAL(10,2) NOT NULL DEFAULT 0,
    estoque INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTES
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(30),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PEDIDOS
CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id),
    status VARCHAR(30) NOT NULL DEFAULT 'recebido'
        CHECK (status IN (
            'recebido',
            'confirmado',
            'em_preparo',
            'entregue',
            'cancelado'
        )),
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    observacao TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ITENS DOS PEDIDOS
CREATE TABLE public.itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id),
    produto_id UUID REFERENCES public.produtos(id),
    nome_produto VARCHAR(100) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL,
    custo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- 5. MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE public.movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES public.produtos(id),
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    motivo TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÍNDICES
CREATE INDEX idx_pedidos_criado_em
ON public.pedidos(criado_em);

CREATE INDEX idx_pedidos_status
ON public.pedidos(status);

CREATE INDEX idx_itens_pedido_pedido
ON public.itens_pedido(pedido_id);

CREATE INDEX idx_movimentacoes_produto
ON public.movimentacoes_estoque(produto_id);

-- 7. SEGURANÇA RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;