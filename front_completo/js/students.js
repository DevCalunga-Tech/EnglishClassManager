// js/students.js

async function loadStudentsScreen() {
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-xl font-bold text-slate-800">Gestão de Alunos</h1>
                <p class="text-sm text-slate-500 mt-0.5">Regista, edita e matricula estudantes nas turmas.</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input type="text" id="student-search" placeholder="Pesquisar aluno..." oninput="filterStudentsTable()"
                    class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-48">
                <button onclick="showStudentModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                    <i class="fa-solid fa-plus"></i> Novo Aluno
                </button>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto -mx-4 sm:mx-0">
            <table class="w-full text-left border-collapse min-w-[560px]">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nível</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody id="students-table-body" class="divide-y divide-slate-100 text-sm text-slate-700">
                    <tr><td colspan="4" class="p-8 sm:p-10 text-center text-slate-400">A carregar alunos...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    await fetchAndRenderStudents();
}

let _allStudents = [];

async function fetchAndRenderStudents() {
    try {
        const students = await apiRequest('/students', 'GET');
        _allStudents = students || [];
        renderStudentsTable(_allStudents);
    } catch (err) {
        document.getElementById('students-table-body').innerHTML =
            `<tr><td colspan="4" class="p-10 text-center text-red-500">Erro ao carregar alunos.</td></tr>`;
    }
}

function filterStudentsTable() {
    const q = document.getElementById('student-search')?.value.toLowerCase() || '';
    renderStudentsTable(_allStudents.filter(s =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    ));
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-10 text-center text-slate-400 italic">Nenhum aluno encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = students.map(s => `
        <tr class="hover:bg-slate-50 transition" id="stud-row-${s.id}">
            <td class="p-3 sm:p-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                        ${s.name.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-semibold text-slate-800">${s.name}</span>
                </div>
            </td>
            <td class="p-3 sm:p-4 text-slate-500">
                <div>${s.email}</div>
                <div class="text-xs text-slate-400">${s.phone || 'Sem telefone'}</div>
            </td>
            <td class="p-3 sm:p-4">
                <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-semibold">${s.level}</span>
            </td>
            <td class="p-3 sm:p-4">
                <div class="flex flex-wrap gap-2">
                    <button onclick='showEnrollmentModal(${s.id}, ${JSON.stringify(s.name)})' class="btn-action btn-indigo"><i class="fa-solid fa-link"></i> Matricular</button>
                    <button onclick='viewStudentFeedback(${s.id}, ${JSON.stringify(s.name)})' class="btn-action btn-slate"><i class="fa-solid fa-folder-open"></i> Ficha</button>
                    <button onclick="showStudentModal(${JSON.stringify(s).replace(/"/g,'&quot;')})" class="btn-action btn-amber"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                    <button onclick='deleteStudent(${s.id}, ${JSON.stringify(s.name)})' class="btn-action btn-red"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ── MODAL CRIAR / EDITAR ALUNO ─────────────────────────────────────
function showStudentModal(currentStudent = null) {
    if (document.getElementById('student-modal')) return;
    const isEdit = currentStudent !== null;
    const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];

    const modal = document.createElement('div');
    modal.id = 'student-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
            <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center gap-3">
                <h3 class="font-bold text-slate-800">${isEdit ? 'Editar Aluno' : 'Cadastrar Aluno'}</h3>
                <button onclick="document.getElementById('student-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form id="student-form" class="p-4 sm:p-5 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nome Completo</label>
                    <input type="text" id="modal-stud-name" required value="${isEdit ? currentStudent.name : ''}" placeholder="Ex: Mateus Silva"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">E-mail</label>
                    <input type="email" id="modal-stud-email" required value="${isEdit ? currentStudent.email : ''}" placeholder="Ex: mateus@exemplo.com"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Telefone</label>
                    <input type="text" id="modal-stud-phone" value="${isEdit && currentStudent.phone ? currentStudent.phone : ''}" placeholder="Ex: 923 000 000"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nível de Inglês</label>
                    <select id="modal-stud-level" required class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                        ${levels.map(l => `<option value="${l}" ${isEdit && currentStudent.level === l ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" onclick="document.getElementById('student-modal').remove()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancelar</button>
                    <button type="submit" id="btn-save-student" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow w-full sm:w-auto">
                        ${isEdit ? 'Atualizar' : 'Criar Aluno'}
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-student');
        btn.disabled = true; btn.textContent = 'A processar...';

        const payload = {
            name:  document.getElementById('modal-stud-name').value.trim(),
            email: document.getElementById('modal-stud-email').value.trim(),
            phone: document.getElementById('modal-stud-phone').value.trim(),
            level: document.getElementById('modal-stud-level').value,
        };

        try {
            if (isEdit) await apiRequest(`/students/${currentStudent.id}`, 'PUT', payload);
            else        await apiRequest('/students', 'POST', payload);

            document.getElementById('student-modal').remove();
            showToast(isEdit ? 'Aluno atualizado!' : 'Aluno criado com sucesso!');
            await fetchAndRenderStudents();
        } catch (err) {
            showToast('Erro: ' + err.message, 'error');
            btn.disabled = false;
            btn.textContent = isEdit ? 'Atualizar' : 'Criar Aluno';
        }
    });
}

async function deleteStudent(id, name) {
    if (!confirm(`Eliminar o aluno "${name}"?\nAs matrículas e registos associados serão afetados.`)) return;
    try {
        await apiRequest(`/students/${id}`, 'DELETE');
        showToast('Aluno eliminado.');
        await fetchAndRenderStudents();
    } catch (err) {
        showToast('Erro ao eliminar: ' + err.message, 'error');
    }
}

// ── MODAL MATRÍCULA ────────────────────────────────────────────────
async function showEnrollmentModal(studentId, studentName) {
    if (document.getElementById('enrollment-modal')) return;

    try {
        const classes = await apiRequest('/classes', 'GET');
        if (!classes || classes.length === 0) {
            showToast('Cria primeiro uma turma antes de matricular.', 'warn');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'enrollment-modal';
        modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
                <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center gap-3">
                    <h3 class="font-bold text-slate-800">Matricular Aluno</h3>
                    <button onclick="document.getElementById('enrollment-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                </div>
                <form id="enrollment-form" class="p-4 sm:p-5 space-y-4">
                    <p class="text-sm text-slate-600">A matricular: <strong class="text-slate-800">${studentName}</strong></p>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Selecionar Turma</label>
                        <select id="modal-enroll-class" required class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
                            ${classes.map(c => `<option value="${c.id}">${c.name} — ${c.level}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                        <button type="button" onclick="document.getElementById('enrollment-modal').remove()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancelar</button>
                        <button type="submit" id="btn-enroll" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow w-full sm:w-auto">Confirmar Matrícula</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('enrollment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-enroll');
            btn.disabled = true; btn.textContent = 'A processar...';
            const class_id = document.getElementById('modal-enroll-class').value;
            try {
                await apiRequest('/enrollments', 'POST', { student_id: studentId, class_id });
                document.getElementById('enrollment-modal').remove();
                showToast(`${studentName} matriculado com sucesso!`);
            } catch (err) {
                showToast('Erro ao matricular: ' + err.message, 'error');
                btn.disabled = false; btn.textContent = 'Confirmar Matrícula';
            }
        });

    } catch (err) {
        showToast('Erro ao carregar turmas: ' + err.message, 'error');
    }
}

// ── FICHA PEDAGÓGICA (abre ecrã de feedback) ──────────────────────
function viewStudentFeedback(studentId, studentName) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    setBreadcrumb('Ficha Pedagógica', studentName);
    loadStudentFeedbackScreen(studentId, studentName);
}
