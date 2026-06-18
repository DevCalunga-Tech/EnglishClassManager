// js/dashboard.js

// ─── UTILIDADE: TOAST ───────────────────────────────────────────────
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const inner = document.getElementById('toast-inner');
    const colors = {
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        error:   'bg-red-50 text-red-800 border-red-200',
        info:    'bg-blue-50 text-blue-800 border-blue-200',
        warn:    'bg-amber-50 text-amber-800 border-amber-200',
    };
    const icons = {
        success: '<i class="fa-solid fa-circle-check"></i>',
        error: '<i class="fa-solid fa-circle-xmark"></i>',
        info: '<i class="fa-solid fa-circle-info"></i>',
        warn: '<i class="fa-solid fa-triangle-exclamation"></i>',
    };
    inner.className = `px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 border ${colors[type]}`;
    inner.innerHTML = `<span>${icons[type]}</span> ${message}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ─── UTILIDADE: BREADCRUMB ───────────────────────────────────────────
function setBreadcrumb(title, subtitle) {
    document.getElementById('page-breadcrumb').innerHTML = `
        <h2 class="text-base font-bold text-slate-800">${title}</h2>
        <p class="text-xs text-slate-400">${subtitle}</p>
    `;
}

// ─── NAVEGAÇÃO CENTRAL ───────────────────────────────────────────────
function handleMenuClick(section) {
    // Remover active de todos
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    if (section === 'classes') {
        document.getElementById('menu-classes').classList.add('active');
        setBreadcrumb('Turmas', 'Gere as turmas de inglês do sistema');
        loadClassesScreen();
    } else if (section === 'students') {
        document.getElementById('menu-students').classList.add('active');
        setBreadcrumb('Alunos', 'Registo e matrícula de estudantes');
        loadStudentsScreen();
    } else if (section === 'grades') {
        document.getElementById('menu-grades').classList.add('active');
        setBreadcrumb('Notas & Pautas', 'Lança e consulta notas por turma');
        loadGradesScreen();
    } else if (section === 'attendance-report') {
        document.getElementById('menu-attendance-report').classList.add('active');
        setBreadcrumb('Relatório de Presenças', 'Acompanhamento da assiduidade dos alunos');
        loadAttendanceReportScreen();
    } else if (section === 'users') {
        document.getElementById('menu-users')?.classList.add('active');
        setBreadcrumb('Utilizadores', 'Gestão de perfis e acessos');
        loadUsersScreen();
    }

    closeMobileSidebar();
}

function showDashboardHome() {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById('menu-dashboard').classList.add('active');
    setBreadcrumb('Painel de Controlo', 'Visão geral do sistema');
    renderDashboardHome();
    closeMobileSidebar();
}

function openMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function applyUserToUI(user) {
    if (!user) return;

    const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    const userNameEl = document.getElementById('user-name');
    const userRoleEl = document.getElementById('user-role');
    const userAvatarEl = document.getElementById('user-avatar');
    const sidebarAvatarEl = document.getElementById('sidebar-avatar');
    const sidebarNameEl = document.getElementById('sidebar-name');
    const sidebarRoleEl = document.getElementById('sidebar-role');
    const welcomeNameEl = document.getElementById('welcome-name');

    if (userNameEl) userNameEl.textContent = user.name || '-';
    if (userRoleEl) userRoleEl.textContent = user.role || '-';
    if (userAvatarEl) userAvatarEl.textContent = nameInitial;
    if (sidebarAvatarEl) sidebarAvatarEl.textContent = nameInitial;
    if (sidebarNameEl) sidebarNameEl.textContent = user.name || '-';
    if (sidebarRoleEl) sidebarRoleEl.textContent = user.role || '-';
    if (welcomeNameEl) welcomeNameEl.textContent = user.name || '—';
}

async function showProfileModal() {
    if (document.getElementById('profile-modal')) return;

    let user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
        const response = await apiRequest('/auth/me', 'GET');
        if (response?.user) {
            user = response.user;
            localStorage.setItem('user', JSON.stringify(user));
            applyUserToUI(user);
        }
    } catch (err) {
        // Se falhar, usamos os dados locais para abrir o modal
        console.warn('Não foi possível carregar o perfil atual:', err.message);
    }

    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto">
            <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center gap-3">
                <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-id-card-clip text-indigo-600"></i> Meu Perfil</h3>
                <button onclick="document.getElementById('profile-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form id="profile-form" class="p-4 sm:p-5 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nome</label>
                        <input type="text" id="profile-name" required value="${user.name || ''}"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">E-mail</label>
                        <input type="email" id="profile-email" required value="${user.email || ''}"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-4">
                    <p class="text-sm font-semibold text-slate-700 mb-3">Alterar palavra-passe</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Senha atual</label>
                            <input type="password" id="profile-current-password" placeholder="Opcional"
                                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nova senha</label>
                            <input type="password" id="profile-new-password" placeholder="Deixa vazio se não quiser alterar"
                                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                        </div>
                    </div>
                    <div class="mt-4">
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Confirmar nova senha</label>
                        <input type="password" id="profile-confirm-password" placeholder="Repete a nova senha"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" onclick="document.getElementById('profile-modal').remove()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancelar</button>
                    <button type="submit" id="btn-save-profile" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow flex items-center justify-center gap-2 w-full sm:w-auto">
                        <i class="fa-solid fa-floppy-disk"></i> Guardar Alterações
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const currentPassword = document.getElementById('profile-current-password').value;
        const newPassword = document.getElementById('profile-new-password').value;
        const confirmPassword = document.getElementById('profile-confirm-password').value;
        const btn = document.getElementById('btn-save-profile');

        if (newPassword || confirmPassword || currentPassword) {
            if (!newPassword || !confirmPassword) {
                showToast('Preenche a nova senha e a confirmação.', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showToast('A confirmação da senha não coincide.', 'error');
                return;
            }
        }

        btn.disabled = true;
        btn.innerHTML = 'A guardar...';

        const payload = { name, email };
        if (newPassword) {
            payload.current_password = currentPassword;
            payload.new_password = newPassword;
        }

        try {
            const response = await apiRequest('/auth/me', 'PUT', payload);
            const updatedUser = response.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            applyUserToUI(updatedUser);
            document.getElementById('profile-modal').remove();
            showToast('Perfil atualizado com sucesso!');
        } catch (err) {
            showToast('Erro ao atualizar perfil: ' + err.message, 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Alterações';
        }
    });
}

function showCreateUserModal() {
    showManagedUserModal();
}

let _managedUsers = [];

function loadUsersScreen() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
        showToast('Sem permissão para gerir utilizadores.', 'error');
        return;
    }

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-xl font-bold text-slate-800">Utilizadores</h1>
                <p class="text-sm text-slate-500 mt-0.5">Cria, edita e remove acessos ao sistema.</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input type="text" id="users-search" placeholder="Pesquisar utilizador..." oninput="filterUsersTable()"
                    class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-56">
                <button onclick="showManagedUserModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                    <i class="fa-solid fa-user-plus"></i> Novo Utilizador
                </button>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto -mx-4 sm:mx-0">
            <table class="w-full text-left border-collapse min-w-[760px]">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                        <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</th>
                        <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                        <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody id="users-table-body" class="divide-y divide-slate-100 text-sm text-slate-700">
                    <tr><td colspan="4" class="p-10 text-center text-slate-400">A carregar utilizadores...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    fetchAndRenderUsers();
}

function filterUsersTable() {
    const q = document.getElementById('users-search')?.value.toLowerCase() || '';
    renderUsersTable(_managedUsers.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    ));
}

async function fetchAndRenderUsers() {
    try {
        const users = await apiRequest('/auth/users', 'GET');
        _managedUsers = Array.isArray(users) ? users : [];
        renderUsersTable(_managedUsers);
    } catch (err) {
        document.getElementById('users-table-body').innerHTML = `<tr><td colspan="4" class="p-10 text-center text-red-500">Erro ao carregar utilizadores: ${err.message}</td></tr>`;
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-slate-400 italic">Nenhum utilizador encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-4 font-semibold text-slate-800">${u.name}${u.id === currentUser.id ? ' <span class="text-xs text-indigo-600">(você)</span>' : ''}</td>
            <td class="p-4 text-slate-500">${u.email}</td>
            <td class="p-4"><span class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-semibold capitalize">${u.role}</span></td>
            <td class="p-4">
                <div class="flex flex-wrap gap-2">
                    <button onclick='showManagedUserModal(${JSON.stringify(u).replace(/"/g,'&quot;')})' class="btn-action btn-amber"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                    ${u.id === currentUser.id ? '' : `<button onclick='deleteManagedUser(${u.id}, ${JSON.stringify(u.name)})' class="btn-action btn-red"><i class="fa-solid fa-trash"></i> Eliminar</button>`}
                </div>
            </td>
        </tr>
    `).join('');
}

function showManagedUserModal(currentUser = null) {
    const isEdit = currentUser !== null;
    if (document.getElementById('managed-user-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'managed-user-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto">
            <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center gap-3">
                <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-users-gear text-indigo-600"></i> ${isEdit ? 'Editar Utilizador' : 'Novo Utilizador'}</h3>
                <button onclick="document.getElementById('managed-user-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form id="managed-user-form" class="p-4 sm:p-5 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nome</label>
                        <input type="text" id="managed-user-name" required value="${isEdit ? currentUser.name : ''}" placeholder="Ex: Maria Silva"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">E-mail</label>
                        <input type="email" id="managed-user-email" required value="${isEdit ? currentUser.email : ''}" placeholder="Ex: maria@escola.com"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Perfil</label>
                        <select id="managed-user-role" ${isEdit && currentUser.id === JSON.parse(localStorage.getItem('user') || '{}').id ? 'disabled' : ''} class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                            <option value="teacher" ${isEdit && currentUser.role === 'teacher' ? 'selected' : ''}>Professor</option>
                            <option value="admin" ${isEdit && currentUser.role === 'admin' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">${isEdit ? 'Nova palavra-passe (opcional)' : 'Palavra-passe'}</label>
                        <input type="password" id="managed-user-password" ${isEdit ? 'placeholder="Deixa vazio para não alterar"' : 'required minlength="6" placeholder="Pelo menos 6 caracteres"'}
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    </div>
                </div>
                ${isEdit ? `<p class="text-xs text-slate-400">Se alterares a palavra-passe, ela será aplicada diretamente sem pedir a senha atual.</p>` : ''}
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" onclick="document.getElementById('managed-user-modal').remove()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancelar</button>
                    <button type="submit" id="btn-managed-user" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow flex items-center justify-center gap-2 w-full sm:w-auto">
                        <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Guardar Alterações' : 'Criar Utilizador'}
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('managed-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-managed-user');
        btn.disabled = true;
        btn.innerHTML = 'A guardar...';

        const payload = {
            name: document.getElementById('managed-user-name').value.trim(),
            email: document.getElementById('managed-user-email').value.trim(),
        };

        const roleSelect = document.getElementById('managed-user-role');
        const passwordValue = document.getElementById('managed-user-password').value;

        if (roleSelect && !roleSelect.disabled) {
            payload.role = roleSelect.value;
        }

        if (!isEdit || passwordValue) {
            payload.password = passwordValue;
        }

        try {
            if (isEdit) {
                await apiRequest(`/auth/users/${currentUser.id}`, 'PUT', payload);
                showToast('Utilizador atualizado com sucesso!');
            } else {
                await apiRequest('/auth/users', 'POST', payload);
                showToast('Utilizador criado com sucesso!');
            }

            document.getElementById('managed-user-modal').remove();
            await fetchAndRenderUsers();
        } catch (err) {
            showToast('Erro ao guardar utilizador: ' + err.message, 'error');
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Guardar Alterações' : 'Criar Utilizador'}`;
        }
    });
}

async function deleteManagedUser(id, name) {
    if (!confirm(`Eliminar o utilizador "${name}"?`)) return;
    try {
        await apiRequest(`/auth/users/${id}`, 'DELETE');
        showToast('Utilizador eliminado.');
        await fetchAndRenderUsers();
    } catch (err) {
        showToast('Erro ao eliminar utilizador: ' + err.message, 'error');
    }
}

async function renderDashboardHome() {
    const user = JSON.parse(localStorage.getItem('user'));
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div class="relative overflow-hidden rounded-[28px] p-5 sm:p-7 text-white shadow-[0_24px_60px_rgba(79,70,229,.22)] bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900">
            <div class="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,.28),_transparent_32%)]"></div>
            <div class="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p class="text-indigo-200 text-xs sm:text-sm font-medium mb-1">Bem-vindo de volta,</p>
                    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight" id="welcome-name">—</h1>
                    <p class="text-indigo-100 mt-2 text-sm max-w-2xl">O teu painel pedagógico está pronto. Utiliza o menu lateral para navegar e acompanha o progresso das turmas.</p>
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-sm text-indigo-100/90">
                    <div class="flex items-center gap-3">
                        <span class="icon-badge bg-white/10 text-white shrink-0"><i class="fa-solid fa-layer-group"></i></span>
                        <div>
                            <p class="font-semibold">Gestão centralizada</p>
                            <p class="text-xs text-indigo-200">Turmas, alunos, notas e presenças</p>
                        </div>
                    </div>
                    ${user.role === 'admin' ? `
                        <button onclick="showCreateUserModal()" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-700 font-semibold shadow-lg shadow-black/10 hover:bg-indigo-50 transition">
                            <i class="fa-solid fa-user-plus"></i> Novo Utilizador
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div class="stat-card">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Turmas</p>
                    <h3 class="text-3xl font-extrabold text-slate-800 mt-1" id="dash-classes-count">—</h3>
                    <p class="text-xs text-slate-400 mt-0.5">ativas no sistema</p>
                </div>
                <span class="icon-badge bg-blue-50 text-blue-600"><i class="fa-solid fa-chalkboard-user text-lg"></i></span>
            </div>
            <div class="stat-card">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Alunos</p>
                    <h3 class="text-3xl font-extrabold text-slate-800 mt-1" id="dash-students-count">—</h3>
                    <p class="text-xs text-slate-400 mt-0.5">registados</p>
                </div>
                <span class="icon-badge bg-emerald-50 text-emerald-600"><i class="fa-solid fa-user-graduate text-lg"></i></span>
            </div>
            <div class="stat-card cursor-pointer hover:border-indigo-300 transition" onclick="handleMenuClick('grades')">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Notas</p>
                    <h3 class="text-sm font-bold text-indigo-600 mt-2">Ver Pautas →</h3>
                    <p class="text-xs text-slate-400 mt-0.5">por turma</p>
                </div>
                <span class="icon-badge bg-amber-50 text-amber-600"><i class="fa-solid fa-clipboard-list text-lg"></i></span>
            </div>
            <div class="stat-card cursor-pointer hover:border-indigo-300 transition" onclick="handleMenuClick('attendance-report')">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Presenças</p>
                    <h3 class="text-sm font-bold text-indigo-600 mt-2">Ver Relatório →</h3>
                    <p class="text-xs text-slate-400 mt-0.5">assiduidade</p>
                </div>
                <span class="icon-badge bg-violet-50 text-violet-600"><i class="fa-solid fa-calendar-check text-lg"></i></span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div class="surface-card rounded-2xl p-4 sm:p-5">
                <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-chalkboard-user text-indigo-600"></i> Últimas Turmas</h3>
                <div id="recent-classes" class="space-y-2 text-sm text-slate-500">A carregar...</div>
            </div>
            <div class="surface-card rounded-2xl p-4 sm:p-5">
                <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-user-graduate text-emerald-600"></i> Últimos Alunos</h3>
                <div id="recent-students" class="space-y-2 text-sm text-slate-500">A carregar...</div>
            </div>
        </div>

        <div class="bg-indigo-50/90 border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <h3 class="font-bold text-indigo-800 mb-1 flex items-center gap-2"><i class="fa-solid fa-lightbulb text-indigo-600"></i> Como usar o sistema</h3>
            <p class="text-sm text-indigo-700 leading-relaxed">
                Começa por criar <strong>Turmas</strong>, depois <strong>Alunos</strong> e faz a matrícula. 
                Com os alunos matriculados, podes fazer a <strong>Chamada</strong> diretamente na tela de Turmas, 
                lançar <strong>Notas</strong> e consultar a <strong>Ficha Pedagógica</strong> com feedbacks individuais.
            </p>
        </div>
    `;

    document.getElementById('welcome-name').textContent = user.name;

    try {
        const [classes, students] = await Promise.all([
            apiRequest('/classes', 'GET'),
            apiRequest('/students', 'GET')
        ]);

        if (Array.isArray(classes)) {
            document.getElementById('dash-classes-count').textContent = classes.length;
            const rc = document.getElementById('recent-classes');
            if (classes.length === 0) {
                rc.innerHTML = `<p class="text-slate-400 italic">Nenhuma turma criada ainda.</p>`;
            } else {
                rc.innerHTML = classes.slice(-4).reverse().map(c => `
                    <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <span class="font-medium text-slate-700">${c.name}</span>
                        <span class="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">${c.level}</span>
                    </div>
                `).join('');
            }
        }

        if (Array.isArray(students)) {
            document.getElementById('dash-students-count').textContent = students.length;
            const rs = document.getElementById('recent-students');
            if (students.length === 0) {
                rs.innerHTML = `<p class="text-slate-400 italic">Nenhum aluno registado ainda.</p>`;
            } else {
                rs.innerHTML = students.slice(-4).reverse().map(s => `
                    <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <span class="font-medium text-slate-700">${s.name}</span>
                        <span class="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">${s.level}</span>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
    }
}

// ─── INIT ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userDataString = localStorage.getItem('user');

    if (!token || !userDataString) {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userDataString);

    // Preencher perfil na topbar e sidebar
    applyUserToUI(user);

    if (user.role === 'admin') {
        const usersMenu = document.getElementById('menu-users');
        if (usersMenu) usersMenu.style.display = 'flex';
    }

    // Mostrar home do dashboard ao carregar
    renderDashboardHome();
});
