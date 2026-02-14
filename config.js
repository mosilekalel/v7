// config.js - ARQUIVO CORRIGIDO
const CONFIG = {
    // SUPABASE - Suas chaves reais (já estão corretas)
    SUPABASE_URL: "https://kfhkssruuytpmdogauou.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaGtzc3J1dXl0cG1kb2dhdW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTU4MDcsImV4cCI6MjA4NjU3MTgwN30.5Gu7m1rEj3MEXkA1XYCOqjbPAaDZJT_g5xDVPq_eUpQ",
    
    // MISTRAL AI (se não tiver, comente ou use um valor padrão)
    MISTRAL_API_KEY: "2teKXfar7CxvJCdfucQFJHPMlkat2xTi",
    MISTRAL_AGENT_ID: "ag_019c330d322176b889c96a4155ffc358",
    
    // Controle de ambiente
    IS_DEV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
};

// Torna a configuração disponível globalmente
window.CONFIG = CONFIG;

// Log para confirmar que carregou
console.log('✅ Config carregada:', CONFIG.SUPABASE_URL);