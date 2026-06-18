// js/api.js
const API_URL = 'http://localhost:3000/api';

// Função utilitária para fazer requisições protegidas facilmente
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Se tivermos um token guardado, adicionamos no cabeçalho de Autorização
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Se o token estiver expirado ou for inválido, força o logout
    if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    return response.json();
}