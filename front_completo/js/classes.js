// js/classes.js

async function loadClassesScreen() {
    const mainContent = document.getElementById('main-content');
    const user = JSON.parse(localStorage.getItem('user'));

    mainContent.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-xl font-bold text-slate-800">Turmas de Inglês</h1>
                <p class="text-sm text-slate-500 mt-0.5">Visualiza, cria e gere as turmas ativas.</p>
            </div>
            ${user.role === 'admin' ? `
                <button onclick="showClassModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                    <i class="fa-solid fa-plus"></i> Nova Turma
                </button>
            ` : ''}
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto -mx-4 sm:mx-0">
            <table class="w-full text-left border-collapse min-w-[520px]">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Horário</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nível</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody id="classes-table-body" class="divide-y divide-slate-100 text-sm text-slate-700">
                    <tr><td colspan="4" class="p-8 sm:p-10 text-center text-slate-400">A carregar turmas...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        const classes = await apiRequest('/classes', 'GET');
        const tbody = document.getElementById('classes-table-body');

        if (!classes || classes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-slate-400 italic">Nenhuma turma cadastrada. ${user.role === 'admin' ? 'Cria a primeira clicando em «Nova Turma».' : ''}</td></tr>`;
            return;
        }

        const levelColors = {
            'Beginner':     'bg-green-50 text-green-700 border-green-200',
            'Elementary':   'bg-blue-50 text-blue-700 border-blue-200',
            'Intermediate': 'bg-amber-50 text-amber-700 border-amber-200',
            'Advanced':     'bg-red-50 text-red-700 border-red-200',
        };

        tbody.innerHTML = classes.map(cls => {
            const lvlClass = levelColors[cls.level] || 'bg-slate-100 text-slate-600 border-slate-200';
            const clsJson = JSON.stringify(cls).replace(/"/g, '&quot;');
            return `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-3 sm:p-4 font-semibold text-slate-800">${cls.name}</td>
                    <td class="p-3 sm:p-4 text-slate-500">${cls.schedule}</td>
                    <td class="p-3 sm:p-4">
                        <span class="px-2.5 py-1 ${lvlClass} border rounded-full text-xs font-semibold">${cls.level}</span>
                    </td>
                    <td class="p-3 sm:p-4">
                        <div class="flex flex-wrap gap-2">
                            <button onclick="startAttendance(${cls.id}, '${cls.name.replace(/'/g, "\\'")}')" class="btn-action btn-green"><i class="fa-solid fa-user-check"></i> Chamada</button>
                            <button onclick="viewClassGrades(${cls.id}, '${cls.name.replace(/'/g, "\\'")}')" class="btn-action btn-amber"><i class="fa-solid fa-clipboard-list"></i> Notas</button>
                            ${user.role === 'admin' ? `
                                <button onclick="showClassModal(${clsJson})" class="btn-action btn-slate"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                                <button onclick="deleteClass(${cls.id}, '${cls.name}')" class="btn-action btn-red"><i class="fa-solid fa-trash"></i> Eliminar</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        document.getElementById('classes-table-body').innerHTML = `<tr><td colspan="4" class="p-10 text-center text-red-500">Erro ao carregar turmas do servidor.</td></tr>`;
    }

    // Injetar estilos de botão utilitário (uma vez)
    if (!document.getElementById('btn-styles')) {
        const style = document.createElement('style');
        style.id = 'btn-styles';
        style.textContent = `
            .btn-action { font-size:.75rem; font-weight:600; padding:5px 10px; border-radius:6px; transition:all .15s; cursor:pointer; }
            .btn-green  { background:#ecfdf5; color:#059669; } .btn-green:hover  { background:#059669; color:#fff; }
            .btn-amber  { background:#fffbeb; color:#d97706; } .btn-amber:hover  { background:#d97706; color:#fff; }
            .btn-slate  { background:#f1f5f9; color:#475569; } .btn-slate:hover  { background:#4f46e5; color:#fff; }
            .btn-red    { background:#fef2f2; color:#dc2626; } .btn-red:hover    { background:#dc2626; color:#fff; }
            .btn-indigo { background:#eef2ff; color:#4f46e5; } .btn-indigo:hover { background:#4f46e5; color:#fff; }
        `;
        document.head.appendChild(style);
    }
}

// ── MODAL CRIAR / EDITAR TURMA ─────────────────────────────────────
function showClassModal(currentClass = null) {
    if (document.getElementById('class-modal')) return;
    const isEdit = currentClass !== null;
    const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];

    const modal = document.createElement('div');
    modal.id = 'class-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
            <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center gap-3">
                <h3 class="font-bold text-slate-800">${isEdit ? 'Editar Turma' : 'Nova Turma'}</h3>
                <button onclick="document.getElementById('class-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form id="class-form" class="p-4 sm:p-5 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nome da Turma</label>
                    <input type="text" id="modal-class-name" required value="${isEdit ? currentClass.name : ''}" placeholder="Ex: English Advanced A"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Horário</label>
                    <input type="text" id="modal-class-schedule" required value="${isEdit ? currentClass.schedule : ''}" placeholder="Ex: Seg e Qua 18h–20h"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nível</label>
                    <select id="modal-class-level" required class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                        ${levels.map(l => `<option value="${l}" ${isEdit && currentClass.level === l ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" onclick="document.getElementById('class-modal').remove()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancelar</button>
                    <button type="submit" id="btn-save-class" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow w-full sm:w-auto">
                        ${isEdit ? 'Atualizar' : 'Criar Turma'}
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('class-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-class');
        btn.disabled = true; btn.textContent = 'A processar...';

        const payload = {
            name:     document.getElementById('modal-class-name').value.trim(),
            schedule: document.getElementById('modal-class-schedule').value.trim(),
            level:    document.getElementById('modal-class-level').value,
        };

        try {
            if (isEdit) await apiRequest(`/classes/${currentClass.id}`, 'PUT', payload);
            else        await apiRequest('/classes', 'POST', payload);

            document.getElementById('class-modal').remove();
            showToast(isEdit ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!');
            await loadClassesScreen();
        } catch (err) {
            showToast('Erro ao processar: ' + err.message, 'error');
            btn.disabled = false;
            btn.textContent = isEdit ? 'Atualizar' : 'Criar Turma';
        }
    });
}

async function deleteClass(id, name) {
    if (!confirm(`Eliminar a turma "${name}"?\nEsta ação vai afetar as matrículas associadas.`)) return;
    try {
        await apiRequest(`/classes/${id}`, 'DELETE');
        showToast('Turma eliminada.');
        await loadClassesScreen();
    } catch (err) {
        showToast('Erro ao eliminar: ' + err.message, 'error');
    }
}

// Atalho para ir para notas duma turma
function viewClassGrades(classId, className) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById('menu-grades')?.classList.add('active');
    setBreadcrumb('Notas & Pautas', `Turma: ${className}`);
    loadGradesForClass(classId, className);
}
