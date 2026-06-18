// js/grades.js

// ── ECRÃ PRINCIPAL DE NOTAS (escolher turma) ──────────────────────
async function loadGradesScreen() {
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div>
            <h1 class="text-xl font-bold text-slate-800">Notas & Pautas</h1>
            <p class="text-sm text-slate-500 mt-0.5">Seleciona uma turma para lançar ou consultar notas.</p>
        </div>

        <div id="grades-classes-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="col-span-full text-center text-slate-400 py-8">A carregar turmas...</div>
        </div>
    `;

    try {
        const classes = await apiRequest('/classes', 'GET');
        const grid = document.getElementById('grades-classes-grid');

        if (!classes || classes.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center text-slate-400 italic py-8">Nenhuma turma disponível.</div>`;
            return;
        }

        const lvlColors = {
            'Beginner': 'from-green-500 to-emerald-600',
            'Elementary': 'from-blue-500 to-cyan-600',
            'Intermediate': 'from-amber-500 to-orange-600',
            'Advanced': 'from-red-500 to-pink-600',
        };

        grid.innerHTML = classes.map(c => `
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer group" onclick="loadGradesForClass(${c.id}, '${c.name.replace(/'/g,"\\'")}')">
                <div class="h-2 bg-gradient-to-r ${lvlColors[c.level] || 'from-slate-400 to-slate-600'}"></div>
                <div class="p-5">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="font-bold text-slate-800 group-hover:text-indigo-600 transition">${c.name}</h3>
                            <p class="text-xs text-slate-500 mt-0.5">${c.schedule}</p>
                        </div>
                        <span class="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-semibold">${c.level}</span>
                    </div>
                    <div class="mt-4 flex gap-2">
                        <button onclick='event.stopPropagation(); loadGradesForClass(${c.id}, ${JSON.stringify(c.name)})' class="flex-1 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white py-2 rounded-lg transition flex items-center justify-center gap-1">
                            <i class="fa-solid fa-clipboard-list"></i> Ver Pauta
                        </button>
                        <button onclick='event.stopPropagation(); showAddGradeModal(${c.id}, ${JSON.stringify(c.name)})' class="flex-1 text-xs font-semibold bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white py-2 rounded-lg transition flex items-center justify-center gap-1">
                            <i class="fa-solid fa-plus"></i> Lançar Nota
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        document.getElementById('grades-classes-grid').innerHTML =
            `<div class="col-span-full text-center text-red-500 py-8">Erro ao carregar turmas: ${err.message}</div>`;
    }
}

// ── PAUTA DA TURMA ─────────────────────────────────────────────────
async function loadGradesForClass(classId, className) {
    const mainContent = document.getElementById('main-content');
    setBreadcrumb('Pautas', `Turma: ${className}`);

    mainContent.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <button onclick="loadGradesScreen()" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
                    <i class="fa-solid fa-arrow-left"></i> Voltar para Turmas
                </button>
                <h1 class="text-xl font-bold text-slate-800">Pauta — ${className}</h1>
                <p class="text-sm text-slate-500 mt-0.5">Notas e médias ponderadas dos alunos matriculados.</p>
            </div>
            <button onclick='showAddGradeModal(${classId}, ${JSON.stringify(className)})' class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                <i class="fa-solid fa-plus"></i> Lançar Nota
            </button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto -mx-4 sm:mx-0">
            <table class="w-full text-left border-collapse min-w-[540px]">
                <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Peso (%)</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                        <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody id="grades-table-body" class="divide-y divide-slate-100 text-sm">
                    <tr><td colspan="6" class="p-8 sm:p-10 text-center text-slate-400">A carregar notas...</td></tr>
                </tbody>
            </table>
        </div>

        <div id="grades-summary" class="hidden bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-chart-column text-indigo-600"></i> Médias por Aluno</h3>
            <div id="grades-summary-content"></div>
        </div>
    `;

    await fetchAndRenderGrades(classId, className);
}

async function fetchAndRenderGrades(classId, className) {
    try {
        const data = await apiRequest(`/grades/class/${classId}/list`, 'GET');
        const tbody = document.getElementById('grades-table-body');

        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-slate-400 italic">Nenhuma nota lançada para esta turma.</td></tr>`;
            return;
        }

        const typeBadge = (t) => {
            const map = {
                'test':       'bg-blue-50 text-blue-700 border-blue-200',
                'homework':   'bg-purple-50 text-purple-700 border-purple-200',
                'oral':       'bg-green-50 text-green-700 border-green-200',
                'participation': 'bg-amber-50 text-amber-700 border-amber-200',
            };
            const label = { test: 'Teste', homework: 'T. Casa', oral: 'Oral', participation: 'Participação' };
            return `<span class="px-2 py-0.5 rounded-full border text-xs font-semibold ${map[t] || 'bg-slate-100 text-slate-600 border-slate-200'}">${label[t] || t}</span>`;
        };

        const scoreColor = (v) => v >= 14 ? 'text-emerald-600 font-bold' : v >= 10 ? 'text-slate-800 font-semibold' : 'text-red-600 font-bold';

        tbody.innerHTML = data.map(g => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3 sm:p-4 font-medium text-slate-800">${g.student_name || g.name || `#${g.student_id}`}</td>
                <td class="p-3 sm:p-4">${typeBadge(g.title || g.assessment_type || g.type)}</td>
                <td class="p-3 sm:p-4 text-lg ${scoreColor(parseFloat(g.score || g.value))}">${parseFloat(g.score || g.value).toFixed(1)}</td>
                <td class="p-3 sm:p-4 text-slate-500">${g.weight || '—'}%</td>
                <td class="p-3 sm:p-4 text-slate-500">${g.created_at ? g.created_at.split('T')[0] : g.date ? g.date.split('T')[0] : '—'}</td>
                <td class="p-3 sm:p-4">
                    <button onclick='deleteGrade(${g.id}, ${classId}, ${JSON.stringify(className)})' class="btn-action btn-red"><i class="fa-solid fa-trash"></i> Remover</button>
                </td>
            </tr>
        `).join('');

        // Calcular médias ponderadas por aluno
        renderGradesSummary(data);

    } catch (err) {
        document.getElementById('grades-table-body').innerHTML =
            `<tr><td colspan="6" class="p-10 text-center text-red-500">Erro ao carregar notas: ${err.message}</td></tr>`;
    }
}

function renderGradesSummary(grades) {
    const summary = document.getElementById('grades-summary');
    const content = document.getElementById('grades-summary-content');
    if (!summary || !content) return;

    // Agrupar por aluno
    const byStudent = {};
    grades.forEach(g => {
        const name = g.student_name || g.name || `#${g.student_id}`;
        if (!byStudent[name]) byStudent[name] = [];
        byStudent[name].push(g);
    });

    const rows = Object.entries(byStudent).map(([name, gs]) => {
        let totalWeight = 0, weightedSum = 0;
        gs.forEach(g => {
            const score  = parseFloat(g.score  || g.value  || 0);
            const weight = parseFloat(g.weight || 0);
            weightedSum  += score * weight;
            totalWeight  += weight;
        });
        const media = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '—';
        const color = typeof media === 'string' && media !== '—'
            ? (parseFloat(media) >= 10 ? 'text-emerald-600' : 'text-red-600')
            : 'text-slate-500';

        return `
            <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 gap-3">
                <span class="font-medium text-slate-800">${name}</span>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-slate-400">${gs.length} avaliação${gs.length !== 1 ? 'ões' : ''}</span>
                    <span class="text-lg font-extrabold ${color}">${media}</span>
                </div>
            </div>
        `;
    }).join('');

    content.innerHTML = rows || '<p class="text-slate-400 italic text-sm">Sem dados suficientes.</p>';
    summary.classList.remove('hidden');
}

// ── MODAL LANÇAR NOTA ──────────────────────────────────────────────
async function showAddGradeModal(classId, className) {
    if (document.getElementById('grade-modal')) return;

    // Carregar alunos da turma
    let enrollments = [];
    try {
        enrollments = await apiRequest(`/enrollments/class/${classId}`, 'GET') || [];
    } catch {}

    if (enrollments.length === 0) {
        showToast('Nenhum aluno matriculado nesta turma.', 'warn');
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'grade-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
            <div class="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-pen-to-square text-amber-500"></i> Lançar Nota — ${className}</h3>
                <button onclick="document.getElementById('grade-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form id="grade-form" class="p-5 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Aluno</label>
                    <select id="modal-grade-student" required class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        ${enrollments.map(e => `<option value="${e.student_id}">${e.student_name || e.name || `#${e.student_id}`}</option>`).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nota (0–20)</label>
                        <input type="number" id="modal-grade-score" min="0" max="20" step="0.1" required placeholder="Ex: 15.5"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Peso (%)</label>
                        <input type="number" id="modal-grade-weight" min="1" max="100" required placeholder="Ex: 30"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tipo</label>
                        <select id="modal-grade-type" required class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                            <option value="test">Teste</option>
                            <option value="homework">Trabalho de Casa</option>
                            <option value="oral">Avaliação Oral</option>
                            <option value="participation">Participação</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Data</label>
                        <input type="date" id="modal-grade-date" required value="${new Date().toISOString().split('T')[0]}"
                            class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" onclick="document.getElementById('grade-modal').remove()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancelar</button>
                    <button type="submit" id="btn-save-grade" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm shadow w-full sm:w-auto">Lançar Nota</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('grade-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-grade');
        btn.disabled = true; btn.textContent = 'A processar...';

        const payload = {
            student_id:      parseInt(document.getElementById('modal-grade-student').value),
            class_id:        parseInt(classId),
            score:           parseFloat(document.getElementById('modal-grade-score').value),
            weight:          parseInt(document.getElementById('modal-grade-weight').value),
            assessment_type: document.getElementById('modal-grade-type').value,
            date:            document.getElementById('modal-grade-date').value,
        };

        try {
            await apiRequest('/grades', 'POST', payload);
            document.getElementById('grade-modal').remove();
            showToast('Nota lançada com sucesso!');
            // Recarregar pauta se estiver visível
            if (document.getElementById('grades-table-body')) {
                await fetchAndRenderGrades(classId, className);
            }
        } catch (err) {
            showToast('Erro ao lançar nota: ' + err.message, 'error');
            btn.disabled = false; btn.textContent = 'Lançar Nota';
        }
    });
}

async function deleteGrade(gradeId, classId, className) {
    if (!confirm('Remover esta nota? A ação não pode ser desfeita.')) return;
    try {
        await apiRequest(`/grades/${gradeId}`, 'DELETE');
        showToast('Nota removida.');
        await fetchAndRenderGrades(classId, className);
    } catch (err) {
        showToast('Erro ao remover nota: ' + err.message, 'error');
    }
}

// ── BOLETIM INDIVIDUAL (chamado da ficha pedagógica) ───────────────
async function loadStudentReportCard(studentId, studentName, classId, className) {
    try {
        const response = await apiRequest(`/grades/student/${studentId}/class/${classId}`, 'GET');
        const grades = Array.isArray(response) ? response : (response?.grades || []);
        const weightedAverage = Array.isArray(response) ? null : (response?.weighted_average ?? null);

        if (!grades || grades.length === 0) {
            return `<div class="text-slate-400 italic text-sm py-4">Sem notas lançadas nesta turma.</div>`;
        }

        let totalWeight = 0, weightedSum = 0;
        grades.forEach(g => {
            const s = parseFloat(g.score || g.value || 0);
            const w = parseFloat(g.weight || 0);
            weightedSum += s * w; totalWeight += w;
        });
        const media = weightedAverage !== null
            ? String(weightedAverage)
            : (totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : null);

        const rows = grades.map(g => `
            <div class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
                <span class="text-slate-600">${g.title || g.assessment_type || g.type || '—'} · ${g.created_at ? g.created_at.split('T')[0] : g.date ? g.date.split('T')[0] : '—'}</span>
                <div class="flex gap-3 items-center">
                    <span class="text-xs text-slate-400">${g.weight || 0}%</span>
                    <span class="font-bold ${parseFloat(g.score||g.value)>=10?'text-emerald-600':'text-red-600'}">${parseFloat(g.score||g.value).toFixed(1)}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="space-y-1">${rows}</div>
            ${media ? `<div class="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span class="text-xs font-bold text-slate-500 uppercase">Média Ponderada</span>
                <span class="text-xl font-extrabold ${parseFloat(media)>=10?'text-emerald-600':'text-red-600'}">${media}</span>
            </div>` : ''}
        `;
    } catch {
        return `<div class="text-red-400 text-sm py-2">Erro ao carregar notas.</div>`;
    }
}
