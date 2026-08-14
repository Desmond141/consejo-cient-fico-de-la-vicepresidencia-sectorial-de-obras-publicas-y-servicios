(function () {
  const SESSION_KEY = 'obras_dashboard_session';
  const PROJECTS_KEY = 'obras_dashboard_projects';

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function redirectToLogin() {
    window.location.href = 'login.html';
  }

  function getProjects() {
    if (window.DashboardData && typeof window.DashboardData.getProjects === 'function') {
      return window.DashboardData.getProjects();
    }
    try {
      return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    } catch (error) {
      return [];
    }
  }

  function openProject(projectId) {
    if (!projectId) return;
    localStorage.setItem('obras_dashboard_selected_project', projectId);
    window.location.href = 'index.html';
  }

  function renderWelcomeName() {
    const session = getSession();
    const welcomeEl = document.getElementById('welcome-superadmin');
    if (!welcomeEl) return;

    const nombre = session && session.nombre ? session.nombre : 'Superadmin';
    welcomeEl.textContent = `Bienvenido, ${nombre}`;
  }

  function renderProjectSearch() {
    const input = document.getElementById('input-buscar-proyecto');
    const list = document.getElementById('lista-proyectos-busqueda');
    const panel = document.getElementById('superadmin-search-panel');

    if (!input || !list || !panel) return;

    const projects = getProjects();

    const updateList = (term = '') => {
      const query = term.trim().toLowerCase();
      const filtered = projects.filter(project => {
        const nombre = (project.nombre || '').toLowerCase();
        const codigo = (project.codigo || '').toLowerCase();
        return !query || nombre.includes(query) || codigo.includes(query);
      });

      if (!filtered.length) {
        list.innerHTML = '<li class="rounded-xl border border-dashed border-slate-700 px-3 py-3 text-sm text-slate-500">No se encontraron proyectos.</li>';
        return;
      }

      list.innerHTML = filtered.map(project => `
        <li>
          <button type="button" data-project-id="${project.id}" class="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-left transition hover:border-sky-400/60 hover:bg-slate-800">
            <div class="flex items-center justify-between gap-3">
              <span class="font-semibold text-white">${project.nombre}</span>
              <span class="text-xs text-sky-300">${project.codigo || 'SIN-CÓDIGO'}</span>
            </div>
            <p class="mt-1 text-xs text-slate-400">${project.descripcion || 'Sin descripción'}</p>
          </button>
        </li>
      `).join('');

      list.querySelectorAll('button[data-project-id]').forEach(button => {
        button.addEventListener('click', () => openProject(button.dataset.projectId));
      });
    };

    input.addEventListener('input', (event) => updateList(event.target.value));
    updateList();
  }

  function bindActions() {
    const btnProyectos = document.getElementById('btn-superadmin-proyectos');
    const panel = document.getElementById('superadmin-search-panel');
    const btnAgregarProyecto = document.getElementById('btn-agregar-proyecto-home');
    const btnGestionUsuarios = document.getElementById('btn-gestionar-usuarios-home');
    const btnDashboard = document.getElementById('btn-ir-dashboard');
    const logoutBtn = document.getElementById('logout-btn');

    if (btnProyectos && panel) {
      btnProyectos.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        const input = document.getElementById('input-buscar-proyecto');
        setTimeout(() => input && input.focus(), 50);
      });
    }

    if (btnAgregarProyecto) {
      btnAgregarProyecto.addEventListener('click', () => {
        window.location.href = 'index.html#proyectos';
      });
    }

    if (btnGestionUsuarios) {
      btnGestionUsuarios.addEventListener('click', () => {
        window.location.href = 'index.html#usuarios';
      });
    }

    if (btnDashboard) {
      btnDashboard.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        redirectToLogin();
      });
    }
  }

  function ensureAllowedAccess() {
    const session = getSession();
    if (!session) {
      redirectToLogin();
      return;
    }

    const allowed =
      session.rol === 'Superadmin' ||
      session.nombre === 'Gingerlin Molina' ||
      session.username === 'Gingerlin.M' ||
      session.nombre === 'Kevinson Campos' ||
      session.username === 'Kevinson.C' ||
      session.rol === 'Programador' ||
      session.username === 'Jonas';

    if (!allowed) {
      window.location.href = 'index.html';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureAllowedAccess();
    renderWelcomeName();
    renderProjectSearch();
    bindActions();
  });
})();
