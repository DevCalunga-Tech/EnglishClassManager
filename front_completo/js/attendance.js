// js/attendance.js

// ── CHAMADA DIÁRIA ─────────────────────────────────────────────────
async function startAttendance(classId, className) {
    const mainContent = document.getElementById('main-content');
    setBreadcrumb('Diário de Presenças', `Turma: ${className}`);
    const hoje = new Date().toISOString().split('T')[0];

    mainContent.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <button onclick="handleMenuClick('classes')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mb-2">
                    <i class="fa-solid fa-arrow-left"></i> Voltar para Turmas
                </button>
                <h1 class="text-xl font-bold text-slate-800">Diário de Presenças</h1>
                <p class="text-sm text-slate-500 mt-0.5">Turma: <span class="font-semibold text-slate-700">${className}</span></p>
            </div>
            <div class="flex items-center gap-2 bg-white px-4 py-2.5 border border-slate-200 rounded-lg shadow-sm">
                <label for="attendance-date" class="text-xs font-bold text-slate-500 uppercase">Data:</label>
                <input type="date" id="attendance-date" value="${hoje}" class="text-sm font-medium text-slate-700 focus:outline-none">
            </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto -mx-4 sm:mx-0">
            <form id="attendance-form">
                <table class="w-full text-left border-collapse min-w-[360px]">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                            <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Presença</th>
                        </tr>
                    </thead>
                    <tbody id="attendance-table-body" class="divide-y divide-slate-100 text-sm">
                        <tr><td colspan="2" class="p-8 sm:p-10 text-center text-slate-400">A carregar alunos matriculados...</td></tr>
                    </tbody>
                </table>
                <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <p class="text-xs text-slate-400">Todos os alunos estão marcados como <strong>Presente</strong> por defeito.</p>
                    <button type="submit" id="btn-save-attendance" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                        <i class="fa-solid fa-floppy-disk"></i> Guardar Chamada
                    </button>
                </div>
            </form>
        </div>
    `;

    try {
        const enrollments = await apiRequest(`/enrollments/class/${classId}`, 'GET');

        const tbody = document.getElementById('attendance-table-body');

        if (!enrollments || enrollments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" class="p-10 text-center text-slate-400 italic">Nenhum aluno matriculado nesta turma.</td></tr>`;
            document.getElementById('btn-save-attendance').disabled = true;
            document.getElementById('btn-save-attendance').classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        tbody.innerHTML = enrollments.map(enr => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-4 font-medium text-slate-800">
                    <div class="flex items-center gap-3">
                        <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            ${(enr.student_name || enr.name || '?').charAt(0).toUpperCase()}
                        </div>
                        ${enr.student_name || enr.name || `Aluno #${enr.student_id}`}
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex items-center justify-center gap-5">
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="status-${enr.student_id}" value="present" checked class="w-4 h-4 accent-emerald-600">
                            <span class="text-xs font-semibold text-emerald-700">Presente</span>
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="status-${enr.student_id}" value="absent" class="w-4 h-4 accent-red-600">
                            <span class="text-xs font-semibold text-red-700">Ausente</span>
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="status-${enr.student_id}" value="late" class="w-4 h-4 accent-amber-600">
                            <span class="text-xs font-semibold text-amber-700">Atraso</span>
                        </label>
                    </div>
                </td>
            </tr>
        `).join('');

        document.getElementById('attendance-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-save-attendance');
            btn.disabled = true; btn.textContent = 'A guardar...';

            const selectedDate = document.getElementById('attendance-date').value;
            const records = enrollments.map(enr => {
                const radios = document.getElementsByName(`status-${enr.student_id}`);
                let status = 'present';
                for (const r of radios) { if (r.checked) { status = r.value; break; } }
                return { student_id: enr.student_id, class_id: classId, date: selectedDate, status };
            });

            try {
                await apiRequest('/attendance', 'POST', {
                    class_id: parseInt(classId, 10),
                    date: selectedDate,
                    records,
                });
                showToast('Chamada guardada com sucesso!');
                handleMenuClick('classes');
            } catch (err) {
                showToast('Erro ao guardar chamada: ' + err.message, 'error');
                btn.disabled = false; btn.textContent = 'Guardar Chamada';
            }
        });

    } catch (err) {
        console.error(err);
        document.getElementById('attendance-table-body').innerHTML =
            `<tr><td colspan="2" class="p-10 text-center text-red-500">Erro ao carregar alunos: ${err.message}</td></tr>`;
    }
}

// ── RELATÓRIO GERAL DE PRESENÇAS ───────────────────────────────────
async function loadAttendanceReportScreen() {
    const mainContent = document.getElementById('main-content');
    const hoje = new Date().toISOString().split('T')[0];

    mainContent.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-xl font-bold text-slate-800">Relatório de Presenças</h1>
                <p class="text-sm text-slate-500 mt-0.5">Consulta a assiduidade por aluno e turma.</p>
            </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="flex-1">
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Turma</label>
                    <select id="report-class-select" class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option value="">Selecionar turma...</option>
                    </select>
                </div>
                <div class="flex-1">
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Data</label>
                    <input type="date" id="report-date" value="${hoje}" class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                </div>
                <div class="flex-1">
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Aluno (opcional)</label>
                    <select id="report-student-select" class="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                        <option value="">Todos os alunos</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button onclick="runAttendanceReport()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition text-sm whitespace-nowrap flex items-center justify-center gap-2 w-full">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> Gerar Relatório
                    </button>
                </div>
            </div>
        </div>

        <div id="report-output"></div>
    `;

    // Carregar turmas no select
    try {
        const classes = await apiRequest('/classes', 'GET');
        const sel = document.getElementById('report-class-select');
        if (classes && classes.length > 0) {
            classes.forEach(c => {
                sel.innerHTML += `<option value="${c.id}">${c.name} — ${c.level}</option>`;
            });
        }

        // Ao mudar turma, carregar os alunos dessa turma
        sel.addEventListener('change', async () => {
            const classId = sel.value;
            const stuSel = document.getElementById('report-student-select');
            stuSel.innerHTML = '<option value="">Todos os alunos</option>';
            if (!classId) return;
            try {
                const enrollments = await apiRequest(`/enrollments/class/${classId}`, 'GET');
                if (enrollments && enrollments.length > 0) {
                    enrollments.forEach(e => {
                        stuSel.innerHTML += `<option value="${e.student_id}">${e.student_name || e.name || `Aluno #${e.student_id}`}</option>`;
                    });
                }
            } catch {}
        });
    } catch (err) {
        showToast('Erro ao carregar turmas: ' + err.message, 'error');
    }
}

async function runAttendanceReport() {
    const classId   = document.getElementById('report-class-select').value;
    const date      = document.getElementById('report-date').value;
    const studentId = document.getElementById('report-student-select').value;
    const output    = document.getElementById('report-output');

    if (!classId) { showToast('Seleciona uma turma primeiro.', 'warn'); return; }
    if (!date) { showToast('Seleciona uma data primeiro.', 'warn'); return; }

    output.innerHTML = `<div class="text-center text-slate-400 py-8">A gerar relatório...</div>`;

    try {
        let data;
        if (studentId) {
            data = await apiRequest(`/attendance/report/student/${studentId}/class/${classId}`, 'GET');
        } else {
            // Relatório da turma por data (busca registos por classe)
            data = await apiRequest(`/attendance/class/${classId}?date=${encodeURIComponent(date)}`, 'GET');
        }

        const isArray = Array.isArray(data);

        if (!data || (isArray && data.length === 0)) {
            output.innerHTML = `<div class="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 italic">Nenhum registo de presença encontrado para os filtros selecionados.</div>`;
            return;
        }

        if (!isArray) {
            const total = parseInt(data.total_classes || 0, 10);
            const present = parseInt(data.total_presents || 0, 10) + parseInt(data.total_lates || 0, 10);
            const absent = parseInt(data.total_absents || 0, 10);
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;

            output.innerHTML = `
                <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 class="text-lg font-bold text-slate-800">Resumo do Aluno</h2>
                            <p class="text-sm text-slate-500">Assiduidade na turma selecionada</p>
                        </div>
                        <div class="text-sm text-slate-500">
                            <span class="font-semibold text-slate-700">${data.student_name || 'Aluno'}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div class="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        <p class="text-2xl font-extrabold text-slate-800 mt-1">${total}</p>
                    </div>
                    <div class="bg-white border border-emerald-200 rounded-xl p-4 text-center shadow-sm">
                        <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Presenças</p>
                        <p class="text-2xl font-extrabold text-emerald-700 mt-1">${present}</p>
                    </div>
                    <div class="bg-white border border-red-200 rounded-xl p-4 text-center shadow-sm">
                        <p class="text-xs font-bold text-red-500 uppercase tracking-wider">Faltas</p>
                        <p class="text-2xl font-extrabold text-red-600 mt-1">${absent}</p>
                    </div>
                    <div class="bg-white border border-amber-200 rounded-xl p-4 text-center shadow-sm">
                        <p class="text-xs font-bold text-amber-600 uppercase tracking-wider">Taxa Presença</p>
                        <p class="text-2xl font-extrabold ${pct >= 75 ? 'text-emerald-600' : 'text-red-600'} mt-1">${pct}%</p>
                    </div>
                </div>
            `;
            return;
        }

        // Calcular estatísticas
        const total    = data.length;
        const present  = data.filter(r => r.status === 'present').length;
        const absent   = data.filter(r => r.status === 'absent').length;
        const late     = data.filter(r => r.status === 'late').length;
        const pct      = total > 0 ? Math.round((present / total) * 100) : 0;

        const statusBadge = (s) => {
            const map = {
                present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                absent:  'bg-red-50 text-red-700 border-red-200',
                late:    'bg-amber-50 text-amber-700 border-amber-200',
            };
            const label = { present: 'Presente', absent: 'Ausente', late: 'Atraso' };
            return `<span class="px-2.5 py-0.5 rounded-full border text-xs font-semibold ${map[s] || 'bg-slate-100 text-slate-600 border-slate-200'}">${label[s] || s}</span>`;
        };

        output.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div class="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    <p class="text-2xl font-extrabold text-slate-800 mt-1">${total}</p>
                </div>
                <div class="bg-white border border-emerald-200 rounded-xl p-4 text-center shadow-sm">
                    <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Presenças</p>
                    <p class="text-2xl font-extrabold text-emerald-700 mt-1">${present}</p>
                </div>
                <div class="bg-white border border-red-200 rounded-xl p-4 text-center shadow-sm">
                    <p class="text-xs font-bold text-red-500 uppercase tracking-wider">Faltas</p>
                    <p class="text-2xl font-extrabold text-red-600 mt-1">${absent}</p>
                </div>
                <div class="bg-white border border-amber-200 rounded-xl p-4 text-center shadow-sm">
                    <p class="text-xs font-bold text-amber-600 uppercase tracking-wider">Taxa Presença</p>
                    <p class="text-2xl font-extrabold ${pct >= 75 ? 'text-emerald-600' : 'text-red-600'} mt-1">${pct}%</p>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto -mx-4 sm:mx-0">
                <table class="w-full text-left border-collapse min-w-[360px]">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            ${studentId ? '' : '<th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>'}
                            <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                            <th class="p-3 sm:p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                        ${data.map(r => `
                            <tr class="hover:bg-slate-50">
                                ${studentId ? '' : `<td class="p-3 sm:p-4 font-medium text-slate-800">${r.student_name || r.name || `#${r.student_id}`}</td>`}
                                <td class="p-3 sm:p-4 text-slate-600">${r.date ? r.date.split('T')[0] : r.date}</td>
                                <td class="p-3 sm:p-4">${statusBadge(r.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (err) {
        output.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 text-sm">Erro ao carregar relatório: ${err.message}</div>`;
    }
}
