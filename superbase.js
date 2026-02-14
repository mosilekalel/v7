// supabase.js - VERSÃO COM DEBUG
console.log('🚀 Iniciando supabase.js...');

(function() {
    // Verificar CONFIG
    if (typeof CONFIG === 'undefined') {
        console.error('❌ ERRO CRÍTICO: CONFIG não definido!');
        alert('Erro de configuração: CONFIG não carregado');
        return;
    }
    
    console.log('✅ CONFIG carregado:', CONFIG.SUPABASE_URL);
    
    const SUPABASE_URL = CONFIG.SUPABASE_URL;
    const SUPABASE_KEY = CONFIG.SUPABASE_ANON_KEY;
    
    // Função genérica para requisições Supabase
    async function supabaseFetch(endpoint, options = {}) {
        const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
        const headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...options.headers
        };
        
        console.log(`📡 Requisição para: ${url}`, options.method || 'GET');
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            console.log(`📥 Resposta status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
            }
            
            const data = await response.json();
            console.log('✅ Dados recebidos:', data);
            return data;
        } catch (error) {
            console.error('❌ Erro no fetch:', error);
            throw error;
        }
    }
    
    // ============================================
    // FUNÇÕES PRINCIPAIS
    // ============================================
    
    window.cadastrar = async function(usuario, senha) {
        console.log('📝 Tentando cadastrar:', usuario);
        
        try {
            // Verificar se usuário já existe
            const existentes = await supabaseFetch(`usuarios?usuario=eq.${usuario}`, {
                method: 'GET'
            }).catch(() => []);
            
            if (existentes && existentes.length > 0) {
                console.log('⚠️ Usuário já existe:', usuario);
                return { status: 'error', msg: 'Usuário já existe' };
            }
            
            // Hash da senha (simplificado para teste)
            // NOTA: Em produção, use bcrypt de verdade
            const senhaHash = senha; // Temporário - apenas para teste
            
            // Inserir novo usuário
            const novoUsuario = {
                usuario: usuario,
                senha: senhaHash,
                saldo: 0.00,
                created_at: new Date().toISOString()
            };
            
            console.log('📤 Enviando dados:', novoUsuario);
            
            const result = await supabaseFetch('usuarios', {
                method: 'POST',
                body: JSON.stringify(novoUsuario)
            });
            
            console.log('✅ Cadastro realizado:', result);
            return { status: 'success', data: result };
            
        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            return { status: 'error', msg: 'Erro no servidor: ' + error.message };
        }
    };
    
    window.login = async function(usuario, senha) {
        console.log('🔑 Tentando login:', usuario);
        
        try {
            const usuarios = await supabaseFetch(`usuarios?usuario=eq.${usuario}`, {
                method: 'GET'
            });
            
            if (!usuarios || usuarios.length === 0) {
                console.log('⚠️ Usuário não encontrado:', usuario);
                return { status: 'error', msg: 'Usuário não encontrado' };
            }
            
            const userData = usuarios[0];
            console.log('👤 Usuário encontrado:', userData);
            
            // Verificar senha (simplificado para teste)
            if (userData.senha !== senha) {
                console.log('⚠️ Senha incorreta');
                return { status: 'error', msg: 'Senha incorreta' };
            }
            
            // Salvar sessão
            localStorage.setItem('logado', 'true');
            localStorage.setItem('usuario', usuario);
            localStorage.setItem('user_id', userData.id);
            localStorage.setItem('user_saldo', userData.saldo);
            
            console.log('✅ Login bem-sucedido');
            return { status: 'success', data: userData };
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { status: 'error', msg: 'Erro no servidor: ' + error.message };
        }
    };
    
    window.getSaldo = async function(usuario) {
        try {
            const usuarios = await supabaseFetch(`usuarios?usuario=eq.${usuario}`, {
                method: 'GET'
            });
            
            if (!usuarios || usuarios.length === 0) {
                return { status: 'error', saldo: 0 };
            }
            
            return { status: 'success', saldo: usuarios[0].saldo };
        } catch (error) {
            console.error('Erro ao buscar saldo:', error);
            return { status: 'error', saldo: 0 };
        }
    };
    
    window.pagarSocial = async function(usuario) {
        try {
            const usuarios = await supabaseFetch(`usuarios?usuario=eq.${usuario}`, {
                method: 'GET'
            });
            
            if (!usuarios || usuarios.length === 0) {
                return { status: 'error', msg: 'Usuário não encontrado' };
            }
            
            const userData = usuarios[0];
            const saldoAtual = parseFloat(userData.saldo);
            
            if (saldoAtual < 20) {
                return { status: 'error', msg: 'Saldo insuficiente' };
            }
            
            const novoSaldo = saldoAtual - 20;
            
            await supabaseFetch(`usuarios?id=eq.${userData.id}`, {
                method: 'PATCH',
                headers: { 'Prefer': 'return=minimal' },
                body: JSON.stringify({ saldo: novoSaldo })
            });
            
            localStorage.setItem('user_saldo', novoSaldo);
            return { status: 'success' };
            
        } catch (error) {
            console.error('Erro no pagamento:', error);
            return { status: 'error', msg: 'Erro no pagamento' };
        }
    };
    
    console.log('✅ Supabase.js carregado com funções:', {
        cadastrar: typeof window.cadastrar,
        login: typeof window.login,
        getSaldo: typeof window.getSaldo,
        pagarSocial: typeof window.pagarSocial
    });
})();