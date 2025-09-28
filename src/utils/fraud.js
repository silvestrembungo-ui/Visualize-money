// Stubs simples para prevenção de fraudes.
// Em produção: usar heurísticas mais avançadas, análise de IP, user-agent, comportamento, rate limiting, análise por worker.
module.exports = {
  isLikelyFraud(req) {
    // Exemplo: bloquear se user-agent ausente ou IP privado (muito simplista)
    const ua = req.headers['user-agent'] || '';
    if (!ua) return true;
    // Poderia verificar headers, cookies, padrões de tempo, etc.
    return false;
  }
};
