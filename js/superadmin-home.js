(function () {
  const SESSION_KEY = 'obras_dashboard_session';
  const PROJECTS_KEY = 'obras_dashboard_projects';

  let proyectos = [];
  let editingUserId = null;

  // ── Sesión ────────────────────────────────────────────────────────────────

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function redirectToLogin() {
    window.location.href = 'login.html';
  }

  // ── Proyectos (capa de datos) ─────────────────────────────────────────────

  function syncProjects() {
    if (window.DashboardData && typeof window.DashboardData.getProjects === 'function') {
      proyectos = window.DashboardData.getProjects();
    } else {
      try { proyectos = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
      catch (e) { proyectos = []; }
    }
  }

  function getProjects() {
    syncProjects();
    return proyectos;
  }

  // ── Buscador de proyectos ─────────────────────────────────────────────────

  function openProject(projectId) {
    if (!projectId) return;
    localStorage.setItem('obras_dashboard_selected_project', projectId);
    window.location.href = 'index.html';
  }

  function renderProjectSearch() {
    const input = document.getElementById('input-buscar-proyecto');
    const list  = document.getElementById('lista-proyectos-busqueda');
    const panel = document.getElementById('superadmin-search-panel');
    if (!input || !list || !panel) return;

    const updateList = (term = '') => {
      syncProjects();
      const q = term.trim().toLowerCase();
      const filtered = proyectos.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();
        return !q || nombre.includes(q) || codigo.includes(q);
      });

      if (!filtered.length) {
        list.innerHTML = '<li class="rounded-xl border border-dashed border-slate-700 px-3 py-3 text-sm text-slate-500">No se encontraron proyectos.</li>';
        return;
      }

      list.innerHTML = filtered.map(p => `
        <li>
          <button type="button" data-project-id="${p.id}" class="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-left transition hover:border-sky-400/60 hover:bg-slate-800">
            <div class="flex items-center justify-between gap-3">
              <span class="font-semibold text-white">${p.nombre}</span>
              <span class="text-xs text-sky-300">${p.codigo || 'SIN-CÓDIGO'}</span>
            </div>
            <p class="mt-1 text-xs text-slate-400">${p.descripcion || 'Sin descripción'}</p>
          </button>
        </li>
      `).join('');

      list.querySelectorAll('button[data-project-id]').forEach(btn => {
        btn.addEventListener('click', () => openProject(btn.dataset.projectId));
      });
    };

    input.addEventListener('input', e => updateList(e.target.value));
    updateList();
  }

  // ── Tarjetas de proyectos ─────────────────────────────────────────────────

  function renderProjectCards() {
    const projectList = document.getElementById('project-list');
    if (!projectList) return;
    syncProjects();

    if (!proyectos.length) {
      projectList.innerHTML = '<p class="text-sm text-slate-500">No hay proyectos registrados todavía.</p>';
      return;
    }

    projectList.innerHTML = proyectos.map(p => `
      <div data-project-id="${p.id}" class="project-card group rounded-2xl border border-slate-700/60 bg-slate-900/50 p-4 cursor-pointer hover:border-sky-400/70 transition">
        <div class="flex items-center justify-between mb-3 gap-3">
          <div>
            <h4 class="text-sm font-semibold text-slate-100">${p.nombre}</h4>
            <p class="text-[11px] text-slate-500 mt-1">Código: ${p.codigo || 'N/A'}</p>
          </div>
          <span class="text-xs px-2 py-1 rounded-full ${p.progreso >= 100 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-sky-500/15 text-sky-300'}">${p.progreso}%</span>
        </div>
        <p class="text-sm text-slate-400 mb-3">${p.descripcion || 'Sin descripción'}</p>
        <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
          <div class="h-full rounded-full" style="width:${Math.min(100, Math.max(0, p.progreso))}%; background: linear-gradient(90deg, #38bdf8, #0ea5e9);"></div>
        </div>
        <div class="mt-3 text-[11px] text-slate-500 space-y-1">
          <p>Creado por ${p.creadoPor || 'Superadmin'}</p>
          <p>Creado en ${new Date(p.creadoEn).toLocaleDateString('es-ES')}</p>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-700/40 text-sm text-slate-400 group-hover:text-sky-300">Ver proyecto →</div>
      </div>
    `).join('');

    projectList.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => openProject(card.dataset.projectId));
    });
  }

  // ── Select: proyectos para formulario de usuario ──────────────────────────

  function poblarSelectProyectosUsuario() {
    const sel = document.getElementById('select-usuario-proyecto');
    if (!sel) return;
    syncProjects();
    sel.innerHTML = '';
    if (!proyectos.length) {
      sel.innerHTML = '<option value="">No hay proyectos disponibles</option>';
      return;
    }
    proyectos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nombre;
      sel.appendChild(opt);
    });
  }

  // ── Select: proyectos para eliminar ──────────────────────────────────────

  function poblarSelectProyectosEliminar() {
    const sel = document.getElementById('select-eliminar-proyecto');
    if (!sel) return;
    syncProjects();
    sel.innerHTML = '';
    if (!proyectos.length) {
      sel.innerHTML = '<option value="">No hay proyectos disponibles</option>';
      return;
    }
    proyectos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nombre;
      sel.appendChild(opt);
    });
  }

  // ── Tarjetas de usuarios ──────────────────────────────────────────────────

  function renderUserCards() {
    const userList = document.getElementById('user-list');
    if (!userList) return;
    const users = window.DashboardData && typeof window.DashboardData.getUsers === 'function'
      ? window.DashboardData.getUsers() : [];

    if (!users.length) {
      userList.innerHTML = '<p class="text-sm text-slate-500">No hay usuarios registrados todavía.</p>';
      return;
    }

    userList.innerHTML = users.map(u => `
      <div class="rounded-2xl border border-violet-700/40 bg-slate-900/50 p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-slate-100">${u.nombre}</h4>
          <span class="text-xs px-2 py-1 rounded-full bg-violet-500/15 text-violet-300">${u.rol || 'Usuario'}</span>
        </div>
        <p class="text-sm text-slate-400">${u.email}</p>
        <p class="text-sm text-slate-400">Usuario: ${u.username}</p>
        <div class="mt-3 text-[11px] text-slate-500 space-y-1">
          <p>${u.proyectoNombre ? 'Proyecto: ' + u.proyectoNombre : 'Sin proyecto asignado'}</p>
          ${u.proyectoCodigo ? `<p>Código: ${u.proyectoCodigo}</p>` : ''}
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-action="edit-user" data-user-id="${u.id}" class="rounded-xl bg-slate-800/80 border border-violet-500/20 px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-500/10 transition">Editar</button>
          <button type="button" data-action="delete-user" data-user-id="${u.id}" class="rounded-xl bg-rose-800/80 border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/10 transition">Eliminar</button>
        </div>
      </div>
    `).join('');
  }

  // ── Editar / Resetear formulario usuario ──────────────────────────────────

  function resetUserForm() {
    editingUserId = null;
    const form = document.getElementById('form-crear-usuario');
    if (!form) return;
    form.reset();
    const submitBtn = form.querySelector('button[type="submit"]');
    const cancelBtn = document.getElementById('btn-cancelar-edicion');
    const notice    = document.getElementById('edit-user-notice');
    if (submitBtn) submitBtn.textContent = 'Crear usuario';
    if (cancelBtn) cancelBtn.classList.add('hidden');
    if (notice) notice.textContent = '';
  }

  function populateUserFormForEdit(user) {
    if (!user) return;
    editingUserId = user.id;
    document.getElementById('input-usuario-nombre').value    = user.nombre   || '';
    document.getElementById('input-usuario-username').value  = user.username || '';
    document.getElementById('input-usuario-email').value     = user.email    || '';
    document.getElementById('input-usuario-password').value  = '';
    document.getElementById('select-usuario-rol').value      = user.rol      || 'Usuario';
    document.getElementById('select-usuario-proyecto').value = user.proyectoId || '';
    const form      = document.getElementById('form-crear-usuario');
    const submitBtn = form && form.querySelector('button[type="submit"]');
    const cancelBtn = document.getElementById('btn-cancelar-edicion');
    const notice    = document.getElementById('edit-user-notice');
    if (submitBtn) submitBtn.textContent = 'Guardar cambios';
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    if (notice) notice.textContent = `Editando usuario: ${user.username}`;
    // Abrir panel si estaba colapsado
    const panel = document.getElementById('panel-usuarios');
    if (panel && panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      document.getElementById('icon-toggle-usuarios')?.classList.add('rotate-180');
    }
  }

  function handleUserListClick(event) {
    const editBtn   = event.target.closest('[data-action="edit-user"]');
    const deleteBtn = event.target.closest('[data-action="delete-user"]');
    if (!editBtn && !deleteBtn) return;
    const userId = (editBtn || deleteBtn).dataset.userId;
    if (!userId) return;

    if (editBtn) {
      const user = window.DashboardData && typeof window.DashboardData.getUsers === 'function'
        ? window.DashboardData.getUsers().find(u => u.id === userId) : null;
      if (user) populateUserFormForEdit(user);
      return;
    }

    if (deleteBtn) {
      if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
      if (window.DashboardData && typeof window.DashboardData.deleteUser === 'function') {
        window.DashboardData.deleteUser(userId);
        renderUserCards();
        poblarSelectProyectosUsuario();
        alert('Usuario eliminado correctamente.');
      }
    }
  }

  // ── Nombre de bienvenida ──────────────────────────────────────────────────

  function renderWelcomeName() {
    const session    = getSession();
    const welcomeEl  = document.getElementById('welcome-superadmin');
    if (!welcomeEl) return;
    const nombre = session && session.nombre ? session.nombre : 'Superadmin';
    welcomeEl.textContent = `Bienvenido, ${nombre}`;
  }

  // ── Acordeón: toggle de secciones ────────────────────────────────────────

  function setupAccordion(btnId, panelId, iconId) {
    const btn   = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    const icon  = document.getElementById(iconId);
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const isHidden = panel.classList.toggle('hidden');
      if (icon) icon.classList.toggle('rotate-180', !isHidden);
    });
  }

  // ── Acceso: solo superadmins ──────────────────────────────────────────────

  function ensureAllowedAccess() {
    const session = getSession();
    if (!session) { redirectToLogin(); return; }
    const allowed =
      session.rol === 'Superadmin' ||
      session.nombre === 'Gingerlin Molina' ||
      session.username === 'Gingerlin.M' ||
      session.nombre === 'Kevinson Campos' ||
      session.username === 'Kevinson.C' ||
      session.rol === 'Programador' ||
      session.username === 'Jonas';
    if (!allowed) window.location.href = 'index.html';
  }

  // ── Bindear acciones ──────────────────────────────────────────────────────

  function bindActions() {
    // Buscador de proyectos
    const btnProyectos = document.getElementById('btn-superadmin-proyectos');
    const panel        = document.getElementById('superadmin-search-panel');
    if (btnProyectos && panel) {
      btnProyectos.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        const input = document.getElementById('input-buscar-proyecto');
        setTimeout(() => input && input.focus(), 50);
      });
    }

    // Dashboard button
    const btnDashboard = document.getElementById('btn-ir-dashboard');
    if (btnDashboard) btnDashboard.addEventListener('click', () => { window.location.href = 'index.html'; });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      redirectToLogin();
    });

    // Cancelar edición usuario
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    if (btnCancelar) btnCancelar.addEventListener('click', resetUserForm);

    // Clicks en lista de usuarios
    const userList = document.getElementById('user-list');
    if (userList) userList.addEventListener('click', handleUserListClick);

    // Form: Agregar Proyecto
    const formAgregarProyecto = document.getElementById('form-agregar-proyecto');
    if (formAgregarProyecto) {
      formAgregarProyecto.addEventListener('submit', async e => {
        e.preventDefault();
        const session = getSession();
        const data = {
          nombre:      document.getElementById('input-proyecto-nombre').value.trim(),
          descripcion: document.getElementById('input-proyecto-descripcion').value.trim(),
          progreso:    Number(document.getElementById('input-proyecto-progreso').value || 0),
          creadoPor:   session && session.nombre ? session.nombre : 'Superadmin'
        };
        if (!data.nombre || !data.descripcion) {
          alert('El nombre y la descripción son obligatorios.'); return;
        }
        try {
          await window.DashboardData.createProject(data);
          syncProjects();
          renderProjectCards();
          poblarSelectProyectosEliminar();
          poblarSelectProyectosUsuario();
          formAgregarProyecto.reset();
          const msg = document.getElementById('form-proyecto-success');
          if (msg) { msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 4000); }
        } catch (err) {
          console.error('Error al crear proyecto:', err);
          alert('No se pudo crear el proyecto. Revisa la conexión con el servidor.');
        }
      });
    }

    // Form: Eliminar Proyecto
    const formEliminarProyecto = document.getElementById('form-eliminar-proyecto');
    if (formEliminarProyecto) {
      formEliminarProyecto.addEventListener('submit', async e => {
        e.preventDefault();
        const projectId = document.getElementById('select-eliminar-proyecto').value;
        if (!projectId) return;
        if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
        try {
          await window.DashboardData.deleteProject(projectId);
          if (typeof window.DashboardData.clearProjectFromUsers === 'function') {
            window.DashboardData.clearProjectFromUsers(projectId);
          }
          syncProjects();
          renderProjectCards();
          poblarSelectProyectosEliminar();
          poblarSelectProyectosUsuario();
          const msg = document.getElementById('delete-project-message');
          if (msg) {
            msg.textContent = 'Proyecto eliminado correctamente.';
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
          }
        } catch (err) {
          console.error('Error al eliminar proyecto:', err);
          alert('No se pudo eliminar el proyecto. Revisa la conexión con el servidor.');
        }
      });
    }

    // Form: Crear / Editar Usuario
    const formCrearUsuario = document.getElementById('form-crear-usuario');
    if (formCrearUsuario) {
      formCrearUsuario.addEventListener('submit', e => {
        e.preventDefault();
        const session  = getSession();
        const selProj  = document.getElementById('select-usuario-proyecto');
        const proyecto = proyectos.find(p => p.id === selProj.value);
        const passVal  = document.getElementById('input-usuario-password').value;

        const userData = {
          nombre:         document.getElementById('input-usuario-nombre').value.trim(),
          username:       document.getElementById('input-usuario-username').value.trim(),
          email:          document.getElementById('input-usuario-email').value.trim(),
          password:       passVal,
          rol:            document.getElementById('select-usuario-rol').value,
          proyectoId:     proyecto ? proyecto.id    : '',
          proyectoNombre: proyecto ? proyecto.nombre : '',
          proyectoCodigo: proyecto ? proyecto.codigo : '',
          creadoPor:      session && session.nombre ? session.nombre : 'Superadmin'
        };

        if (!userData.nombre || !userData.username || !userData.email) return;
        if (!editingUserId && !userData.password) {
          alert('La contraseña es requerida para crear un nuevo usuario.'); return;
        }

        if (editingUserId) {
          const payload = {
            nombre:         userData.nombre,
            username:       userData.username,
            email:          userData.email,
            rol:            userData.rol,
            proyectoId:     userData.proyectoId,
            proyectoNombre: userData.proyectoNombre,
            proyectoCodigo: userData.proyectoCodigo,
            passwordHash:   passVal ? btoa(passVal) : undefined
          };
          window.DashboardData.updateUser(editingUserId, payload);
          resetUserForm();
          renderUserCards();
          poblarSelectProyectosUsuario();
          alert(`Usuario actualizado: ${userData.username}`);
        } else {
          window.DashboardData.createUser(userData);
          renderUserCards();
          formCrearUsuario.reset();
          poblarSelectProyectosUsuario();
          alert(`Usuario creado: ${userData.username}`);
        }
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    ensureAllowedAccess();
    renderWelcomeName();
    syncProjects();

    // Acordeones (proyectos abierto por defecto, usuarios colapsado)
    setupAccordion('btn-toggle-usuarios', 'panel-usuarios', 'icon-toggle-usuarios');
    // Proyectos abierto por defecto — no se colapsa al inicio

    renderProjectSearch();
    renderProjectCards();
    poblarSelectProyectosEliminar();
    poblarSelectProyectosUsuario();
    renderUserCards();
    bindActions();
  });

})();
