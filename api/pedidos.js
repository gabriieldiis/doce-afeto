export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            sucesso: false,
            mensagem: "Método não permitido."
        });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Configuração do banco não encontrada."
        });
    }

    try {
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
            console.error("Erro Supabase:", resultado);

            return res.status(502).json({
                sucesso: false,
                mensagem: "Não foi possível registrar o pedido."
            });
        }

        return res.status(201).json(resultado);

    } catch (error) {
        console.error("Erro na API:", error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao registrar o pedido."
        });
    }
}