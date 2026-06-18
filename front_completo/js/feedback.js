// js/feedback.js

// ── FICHA PEDAGÓGICA COMPLETA ──────────────────────────────────────
async function loadStudentFeedbackScreen(studentId, studentName) {
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div>
            <button onclick="handleMenuClick('students')" class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
                <i class="fa-solid fa-arrow-left"></i> Voltar para Alunos
            </button>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3 sm:gap-4">
                    <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                        ${studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 class="text-lg sm:text-xl font-bold text-slate-800">${studentName}</h1>
                        <p class="text-xs sm:text-sm text-slate-500">Ficha Pedagógica · Feedbacks e Notas</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

            <!-- FEEDBACKS (esquerda/maior) -->
            <div class="lg:col-span-3 space-y-4">
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-message text-indigo-600"></i> Feedbacks Pedagógicos</h2>
                        <button onclick='showAddFeedbackModal(${studentId}, ${JSON.stringify(studentName)})' 
                            class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center justify-center gap-1 w-full sm:w-auto">
                            <i class="fa-solid fa-pen-to-square"></i> Novo Feedback
                        </button>
                    </div>
                    <div id="feedback-list" class="p-4 sm:p-5 space-y-3 min-h-[120px]">
                        <div class="text-center text-slate-400 py-6">A carregar feedbacks...</div>
                    </div>
                </div>
            </div>

            <!-- NOTAS POR TURMA (direita/menor) -->
            <div class="lg:col-span-2 space-y-4">
                <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div class="p-4 sm:p-5 border-b border-slate-100">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-clipboard-list text-amber-500"></i> Notas por Turma</h2>
                    </div>
                    <div id="student-grades-section" class="p-4 sm:p-5 min-h-[120px]">
                        <div class="text-center text-slate-400 py-6">A carregar turmas...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Carregar feedbacks e turmas em paralelo
    await Promise.all([
        fetchAndRenderFeedbacks(studentId, studentName),
        fetchStudentClassesAndGrades(studentId, studentName),
    ]);
}

// ── FEEDBACKS ──────────────────────────────────────────────────────
async function fetchAndRenderFeedbacks(studentId, studentName) {
    const container = document.getElementById('feedback-list');
    if (!container) return;

    try {
        const feedbacks = await apiRequest(`/feedbacks/student/${studentId}`, 'GET');

        if (!feedbacks || feedbacks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-6 text-slate-400">
                    <div class="text-3xl mb-2 text-indigo-500"><i class="fa-solid fa-comments"></i></div>
                    <p class="italic text-sm">Nenhum feedback registado ainda.</p>
                    <p class="text-xs mt-1">Clica em "Novo Feedback" para adicionar o primeiro registo.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = feedbacks.map(fb => {
            const feedbackId = fb.feedback_id ?? fb.id;
            return `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 relative group" id="feedback-${feedbackId}">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                        <p class="text-sm text-slate-700 leading-relaxed">${fb.comments || fb.comment || fb.feedback || fb.content}</p>
                        <p class="text-xs text-slate-400 mt-2">${fb.created_at ? fb.created_at.split('T')[0] : fb.date ? fb.date.split('T')[0] : '—'} ${fb.teacher_name ? `· Por ${fb.teacher_name}` : ''}</p>
                    </div>
                    <button onclick='deleteFeedback(${feedbackId}, ${studentId}, ${JSON.stringify(studentName)})'
                        class="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-500 text-lg leading-none flex-shrink-0" title="Remover">
                        &times;
                    </button>
                </div>
            </div>
            `;
        }).join('');

    } catch (err) {
        container.innerHTML = `<div class="text-red-400 text-sm py-4 text-center">Erro ao carregar feedbacks: ${err.message}</div>`;
    }
}

// ── NOTAS POR TURMA ────────────────────────────────────────────────
async function fetchStudentClassesAndGrades(studentId, studentName) {
    const section = document.getElementById('student-grades-section');
    if (!section) return;

    try {
        const enrollments = await apiRequest(`/enrollments/student/${studentId}`, 'GET');

        if (!enrollments || enrollments.length === 0) {
            section.innerHTML = `
                <div class="text-center py-6 text-slate-400">
                    <div class="text-3xl mb-2 text-emerald-500"><i class="fa-solid fa-user-graduate"></i></div>
                    <p class="italic text-sm">Aluno não matriculado em nenhuma turma.</p>
                </div>
            `;
            return;
        }

        section.innerHTML = '<div class="text-slate-400 text-sm py-2">A carregar notas...</div>';

        let html = '';
        for (const enr of enrollments) {
            const classId = enr.class_id;
            const className = enr.class_name || enr.name || `Turma #${classId}`;
            const gradesHtml = await loadStudentReportCard(studentId, studentName, classId, className);
            html += `
                <div class="mb-4 last:mb-0">
                    <h3 class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">${className}</h3>
                    ${gradesHtml}
                </div>
            `;
        }

        section.innerHTML = html || `<p class="text-slate-400 italic text-sm">Sem dados de notas.</p>`;

    } catch (err) {
        section.innerHTML = `<div class="text-red-400 text-sm py-4">Erro: ${err.message}</div>`;
    }
}

// ── MODAL NOVO FEEDBACK ────────────────────────────────────────────
function showAddFeedbackModal(studentId, studentName) {
    if (document.getElementById('feedback-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
            <div class="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center gap-3">
                <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-pen-to-square text-indigo-600"></i> Novo Feedback</h3>
                <button onclick="document.getElementById('feedback-modal').remove()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form id="feedback-form" class="p-4 sm:p-5 space-y-4">
                <p class="text-sm text-slate-600">Aluno: <strong class="text-slate-800">${studentName}</strong></p>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Observação / Feedback</label>
                    <textarea id="modal-feedback-text" required rows="4" placeholder="Ex: Demonstra boa compreensão oral mas precisa melhorar a escrita..."
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"></textarea>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">Data</label>
                    <input type="date" id="modal-feedback-date" required value="${new Date().toISOString().split('T')[0]}"
                        class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button type="button" onclick="document.getElementById('feedback-modal').remove()" class="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancelar</button>
                    <button type="submit" id="btn-save-feedback" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow w-full sm:w-auto">Guardar Feedback</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('feedback-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-feedback');
        btn.disabled = true; btn.textContent = 'A guardar...';

        const payload = {
            student_id: studentId,
            comments:   document.getElementById('modal-feedback-text').value.trim(),
            behavior:   'good',
        };

        try {
            await apiRequest('/feedbacks', 'POST', payload);
            document.getElementById('feedback-modal').remove();
            showToast('Feedback guardado com sucesso!');
            await fetchAndRenderFeedbacks(studentId, studentName);
        } catch (err) {
            showToast('Erro ao guardar: ' + err.message, 'error');
            btn.disabled = false; btn.textContent = 'Guardar Feedback';
        }
    });
}

async function deleteFeedback(feedbackId, studentId, studentName) {
    if (!confirm('Remover este feedback? A ação não pode ser desfeita.')) return;
    try {
        await apiRequest(`/feedbacks/${feedbackId}`, 'DELETE');
        showToast('Feedback removido.');
        await fetchAndRenderFeedbacks(studentId, studentName);
    } catch (err) {
        showToast('Erro ao remover: ' + err.message, 'error');
    }
}
