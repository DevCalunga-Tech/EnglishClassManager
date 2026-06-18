// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Se o utilizador já tiver um token válido guardado, salta direto para o Dashboard
    if (localStorage.getItem('token')) {
        // Evita loop de redirecionamento se já estiver no dashboard
        if (!window.location.href.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }
    }

    // Escutar o evento de submissão do formulário
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            errorMessage.classList.add('hidden');
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao efetuar login.');
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                window.location.href = 'dashboard.html';

            } catch (error) {
                errorText.textContent = error.message;
                errorMessage.classList.remove('hidden');
            }
        });
    }
});

/**
 * FUNÇÃO GLOBAL DE LOGOUT
 * Limpa o token JWT, os dados do utilizador e redireciona para a tela de login.
 */
function logout() {
    // 1. Apaga tudo o que guardámos no navegador (Token e dados do Usuário)
    localStorage.clear(); 
    
    // 2. Redireciona o utilizador de volta para a raiz (Ecrã de Login)
    window.location.href = 'index.html'; 
}