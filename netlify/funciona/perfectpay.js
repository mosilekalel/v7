const { createClient } = require('@supabase/supabase-js');

// O Netlify busca automaticamente as chaves que você salvou no painel (Key/Value)
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
    // A PerfectPay envia os dados via POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método não permitido" };
    }

    try {
        const body = JSON.parse(event.body);
        console.log("Dados recebidos da PerfectPay:", body);

        // Verifica se a venda foi aprovada (status 'aprovado' ou '1')
        if (body.venda_status === 'aprovado' || body.venda_status === '1') {
            const userId = body.usermeta; // O ID do usuário que enviamos pelo link
            const valorVenda = parseFloat(body.valor_venda);

            // Chama a função no banco de dados para somar o saldo
            // Nota: Verifique se sua função SQL no Supabase se chama 'incrementar_saldo_venda'
            const { error } = await supabase.rpc('incrementar_saldo_venda', {
                p_user_id: userId,
                p_valor: valorVenda
            });

            if (error) {
                console.error("Erro ao atualizar saldo no Supabase:", error);
                throw error;
            }
            
            console.log(`Sucesso! Adicionado R$ ${valorVenda} ao usuário ${userId}`);
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: "Webhook processado com sucesso" }) 
        };
    } catch (err) {
        console.error("Erro interno na função:", err);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: err.message }) 
        };
    }
};
