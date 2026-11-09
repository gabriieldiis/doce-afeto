
async function verificarAdministrador(req) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    if (!token) {
        return null;
    }

    // 1. Validar o token do usuário no Supabase Auth
    const authResponse = await fetch(
        `${supabaseUrl}/auth/v1/user`,
        {
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${token}`
            }
        }
    );

if (!authResponse.ok) {
    console.error("Falha na autenticação:", authResponse.status);
    console.error("Resposta Auth:", await authResponse.text());
    return null;
}

    const usuario = await authResponse.json();

    if (!usuario.id) {
        return null;
    }

    // 2. Verificar se o usuário está na tabela de administradores
    const adminResponse = await fetch(
        `${supabaseUrl}/rest/v1/administradores?select=usuario_id&usuario_id=eq.${usuario.id}&limit=1`,
        {
            headers: {
                apikey: supabaseKey
            }
        }
    );

if (!adminResponse.ok) {
    console.error("Falha na consulta de administradores:", adminResponse.status);
    console.error("Resposta Admin:", await adminResponse.text());
    return null;
}

    const administradores = await adminResponse.json();

if (!administradores.length) {
    console.error("Usuário autenticado, mas não encontrado na tabela administradores:", usuario.id);
    return null;
}

    return usuario;
}

export default async function handler(req, res) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Configuração do banco não encontrada."
        });
    }

    try {
        // REGISTRAR PEDIDO — ACESSO PÚBLICO
        if (req.method === "POST") {
            const { nome, whatsapp, itens } = req.body || {};

            if (
                typeof nome !== "string" ||
                !nome.trim() ||
                typeof whatsapp !== "string" ||
                !Array.isArray(itens) ||
                itens.length === 0
            ) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Dados do pedido inválidos."
                });
            }

            const response = await fetch(
                `${supabaseUrl}/rest/v1/rpc/registrar_pedido`,
                {
                    method: "POST",
                    headers: {
                        apikey: supabaseKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        p_nome: nome.trim(),
                        p_telefone: whatsapp,
                        p_itens: itens
                    })
                }
            );

            const resultado = await response.json();

            if (!response.ok) {
                console.error("Erro ao registrar pedido:", resultado);

                return res.status(502).json({
                    sucesso: false,
                    mensagem: "Não foi possível registrar o pedido."
                });
            }

            return res.status(201).json(resultado);
        }

        // PROTEGER CONSULTAS E ALTERAÇÕES
        if (req.method === "GET" || req.method === "PATCH") {
            const usuario = await verificarAdministrador(req);

            if (!usuario) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: "Acesso não autorizado."
                });
            }
        }

        // CONSULTAR PEDIDOS — SOMENTE ADMINISTRADOR
        if (req.method === "GET") {
            const response = await fetch(
                `${supabaseUrl}/rest/v1/pedidos?select=id,status,valor_total,observacao,criado_em,clientes(nome,telefone),itens_pedido(nome_produto,quantidade,preco_unitario,custo_unitario)&order=criado_em.desc`,
                {
                    headers: {
                        apikey: supabaseKey
                    }
                }
            );

            const resultado = await response.json();

            if (!response.ok) {
                console.error("Erro ao consultar pedidos:", resultado);

                return res.status(502).json({
                    sucesso: false,
                    mensagem: "Não foi possível consultar os pedidos."
                });
            }

            return res.status(200).json({
                sucesso: true,
                pedidos: resultado
            });
        }

        // ATUALIZAR STATUS E ESTOQUE — SOMENTE ADMINISTRADOR
        if (req.method === "PATCH") {
            const { pedido_id, status } = req.body || {};

            const statusPermitidos = [
                "pendente",
                "confirmado",
                "em_preparo",
                "pronto",
                "concluido",
                "cancelado"
            ];

            if (
                !pedido_id ||
                !statusPermitidos.includes(status)
            ) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Pedido ou status inválido."
                });
            }

            const response = await fetch(
                `${supabaseUrl}/rest/v1/rpc/atualizar_status_pedido`,
                {
                    method: "POST",
                    headers: {
                        apikey: supabaseKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        p_pedido_id: pedido_id,
                        p_novo_status: status
                    })
                }
            );

            const resultado = await response.json();

            if (!response.ok) {
                console.error("Erro ao atualizar pedido:", resultado);

                return res.status(502).json({
                    sucesso: false,
                    mensagem: "Não foi possível atualizar o pedido."
                });
            }

            return res.status(200).json(resultado);
        }

        return res.status(405).json({
            sucesso: false,
            mensagem: "Método não permitido."
        });

    } catch (error) {
        console.error("Erro na API:", error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno na API."
        });
    }
}
