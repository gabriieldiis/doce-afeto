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
        // REGISTRAR PEDIDO
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

        // ATUALIZAR STATUS E ESTOQUE
        if (req.method === "PATCH") {
            const { pedido_id, status } = req.body || {};

            if (!pedido_id || !status) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Pedido e status são obrigatórios."
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