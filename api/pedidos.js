
export default async function handler(req, res) {
    if (req.method !== "GET") {
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
        const response = await fetch(
            `${supabaseUrl}/rest/v1/produtos?select=id&limit=1`,
            {
                headers: {
                    apikey: supabaseKey
                }
            }
        );

        if (!response.ok) {
            const erro = await response.text();

            console.error("Erro Supabase:", {
                status: response.status,
                resposta: erro
            }); 

                return res.status(502).json({
                    sucesso: false,
                    mensagem: "O Supabase recusou a solicitação.",
                    codigo: response.status,
                    detalhe: erro
                });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "API conectada ao Supabase."
        });

    } catch (error) {
        console.error("Erro na API:", error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Não foi possível conectar ao banco."
        });
    }
}
