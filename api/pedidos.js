
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
                    apikey: supabaseKey,
                    Authorization: `Bearer ${supabaseKey}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Falha na comunicação com o Supabase.");
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
