// supabase.js - VERSÃO CORRIGIDA USANDO CLIENTE OFICIAL
console.log('🚀 Iniciando supabase.js...');

// Aguardar o CONFIG e o Supabase carregarem
(async function() {
    // Verificar CONFIG
    if (typeof CONFIG === 'undefined') {
        console.error('❌ ERRO CRÍTICO: CONFIG não definido!');
        alert('Erro de configuração: CONFIG não carregado');
        return;
    }
    
    console.log('✅ CONFIG carregado:', CONFIG.SUPABASE_URL);
    
    // Verificar se createClient está disponível
    if (typeof createClient === 'undefined') {
        console.error('❌ ERRO: createClient do Supabase não encontrado!');
        alert('Erro: Biblioteca Supabase não carregada');
        return;
    }
    
    // Criar cliente Supabase
    const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log('✅ Cliente Supabase criado');
    
    // ===== LINHA CRÍTICA: EXPOR O CLIENTE GLOBALMENTE =====
    window.supabase = supabase; // Isso permite que outros scripts usem a mesma conexão
    
    // ============================================
    // FUNÇÕES PRINCIPAIS
    // ============================================
    
    window.cadastrar = async function(usuario, senha) {
        console.log('📝 Tentando cadastrar:', usuario);
        
        try {
            // Verificar se usuário já existe
            const { data: existentes, error: checkError } = await supabase
                .from('usuarios')
                .select('usuario')
                .eq('usuario', usuario);
            
            if (checkError) {
                console.error('Erro ao verificar usuário:', checkError);
                return { status: 'error', msg: 'Erro ao verificar usuário' };
            }
            
            if (existentes && existentes.length > 0) {
                console.log('⚠️ Usuário já existe:', usuario);
                return { status: 'error', msg: 'Usuário já existe' };
            }
            
            // SEM BCRYPT por enquanto (para teste)
            const senhaHash = senha;
            
            // Inserir novo usuário
            const { data, error } = await supabase
                .from('usuarios')
                .insert([
                    { 
                        usuario: usuario, 
                        senha: senhaHash,
                        saldo: 100.00, // Mudei para 100 reais iniciais para teste
                        created_at: new Date().toISOString()
                    }
                ])
                .select();
            
            if (error) {
                console.error('❌ Erro no insert:', error);
                
                if (error.code === '23505') {
                    return { status: 'error', msg: 'Usuário já existe' };
                }
                
                return { status: 'error', msg: error.message };
            }
            
            console.log('✅ Cadastro realizado:', data);
            return { status: 'success', data };
            
        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            return { status: 'error', msg: 'Erro no servidor: ' + error.message };
        }
    };
    
    window.login = async function(usuario, senha) {
        console.log('🔑 Tentando login:', usuario);
        
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('usuario', usuario)
                .maybeSingle();
            
            if (error) {
                console.error('❌ Erro na consulta:', error);
                return { status: 'error', msg: 'Erro ao buscar usuário' };
            }
            
            if (!data) {
                console.log('⚠️ Usuário não encontrado:', usuario);
                return { status: 'error', msg: 'Usuário não encontrado' };
            }
            
            console.log('👤 Usuário encontrado:', data);
            
            // Verificar senha (simplificado para teste)
            if (data.senha !== senha) {
                console.log('⚠️ Senha incorreta');
                return { status: 'error', msg: 'Senha incorreta' };
            }
            
            // Salvar sessão
            localStorage.setItem('logado', 'true');
            localStorage.setItem('usuario', usuario);
            localStorage.setItem('user_id', data.id);
            localStorage.setItem('user_saldo', data.saldo);
            
            console.log('✅ Login bem-sucedido');
            return { status: 'success', data };
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { status: 'error', msg: 'Erro no servidor: ' + error.message };
        }
    };
    
    window.getSaldo = async function(usuario) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('saldo')
                .eq('usuario', usuario)
                .maybeSingle();
            
            if (error) {
                console.error('Erro ao buscar saldo:', error);
                return { status: 'error', saldo: 0 };
            }
            
            if (!data) {
                return { status: 'error', saldo: 0 };
            }
            
            return { status: 'success', saldo: data.saldo };
            
        } catch (error) {
            console.error('Erro ao buscar saldo:', error);
            return { status: 'error', saldo: 0 };
        }
    };
    
    window.pagarSocial = async function(usuario) {
        console.log('💰 Processando pagamento social:', usuario);
        
        try {
            // Buscar usuário e saldo
            const { data: userData, error: selectError } = await supabase
                .from('usuarios')
                .select('id, saldo')
                .eq('usuario', usuario)
                .maybeSingle();
            
            if (selectError || !userData) {
                console.error('Usuário não encontrado:', selectError);
                return { status: 'error', msg: 'Usuário não encontrado' };
            }
            
            const saldoAtual = parseFloat(userData.saldo);
            console.log('💰 Saldo atual:', saldoAtual);
            
            if (saldoAtual < 20) {
                console.log('⚠️ Saldo insuficiente:', saldoAtual);
                return { status: 'error', msg: 'Saldo insuficiente' };
            }
            
            const novoSaldo = saldoAtual - 20;
            
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ saldo: novoSaldo })
                .eq('id', userData.id);
            
            if (updateError) {
                console.error('Erro ao atualizar saldo:', updateError);
                return { status: 'error', msg: updateError.message };
            }
            
            localStorage.setItem('user_saldo', novoSaldo);
            console.log('✅ Pagamento realizado. Novo saldo:', novoSaldo);
            
            return { status: 'success' };
            
        } catch (error) {
            console.error('❌ Erro no pagamento:', error);
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
