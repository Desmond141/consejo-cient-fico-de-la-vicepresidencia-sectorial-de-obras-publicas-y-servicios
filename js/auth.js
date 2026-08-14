(function() {
  const SESSION_KEY = 'obras_dashboard_session';

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function isSuperadminLandingUser(session) {
    if (!session) return false;
    const nombre = (session.nombre || '').trim().toLowerCase();
    const username = (session.username || '').trim().toLowerCase();
    return (
      session.rol === 'Superadmin' ||
      session.rol === 'Programador' ||
      nombre === 'gingerlin molina' ||
      username === 'gingerlin.m' ||
      nombre === 'kevinson campos' ||
      username === 'kevinson.c' ||
      username === 'jonas'
    );
  }

  function saveSession(admin) {
    const session = {
      email: admin.email,
      nombre: admin.nombre,
      username: admin.username,
      rol: admin.rol,
      loggedAt: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function redirectToLogin() {
    const path = window.location.pathname;
    if (!path.endsWith('login.html') && !path.endsWith('superadmin-home.html')) {
      window.location.href = 'login.html';
    }
  }

  function redirectToDashboard() {
    const pathname = window.location.pathname;
    const session = getSession();
    const targetPage = isSuperadminLandingUser(session) ? 'superadmin-home.html' : 'index.html';
    if (pathname.endsWith('login.html') || pathname.endsWith('/')) {
      window.location.href = targetPage;
    }
  }

  function showAuthStatus(message) {
    const statusEl = document.getElementById('auth-status');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
  }

  function hideAuthStatus() {
    const statusEl = document.getElementById('auth-status');
    if (!statusEl) return;
    statusEl.classList.add('hidden');
  }

  function renderLoggedUser() {
    const session = getSession();
    const welcomeEl = document.getElementById('welcome-user');
    if (!welcomeEl || !session) return;
    welcomeEl.textContent = `Bienvenido, ${session.nombre}`;
  }

  function initDashboardPage() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearSession();
        window.location.href = 'login.html';
      });
    }
  }

  function initLoginPage() {
    const session = getSession();
    if (session) {
      redirectToDashboard();
      return;
    }

    hideAuthStatus();
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    if (!form) return;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      showAuthStatus('Validando credenciales de Usuario');

      if (window.DashboardData && typeof window.DashboardData.hydrateRemoteData === 'function') {
        try {
          await window.DashboardData.hydrateRemoteData();
        } catch (error) {
          console.warn('No se pudo sincronizar usuarios remotos antes del login:', error);
        }
      }

      const credential = form.email.value.trim();
      const password = form.password.value;
      const admin = window.SuperadminsDB.validateCredentials(credential, password);
      if (!admin) {
        errorEl.textContent = 'Usuario o contraseña incorrectos.';
        errorEl.classList.remove('hidden');
        hideAuthStatus();
        return;
      }

      saveSession(admin);
      redirectToDashboard();
    });
  }

  function protectDashboard() {
    const session = getSession();

    // Sin sesión: redirigir a login de inmediato
    if (!session) {
      redirectToLogin();
      return;
    }

    // Sesión válida: revelar la UI y ocultar botón de login
    const loginLink = document.getElementById('login-link-btn');
    const loggedInContainer = document.getElementById('logged-in-container');
    const btnAgregar = document.getElementById('btn-nav-agregar');
    const headerDesc = document.getElementById('header-description');
    const mainEl = document.getElementById('main-content');

    if (loginLink) loginLink.classList.add('hidden');
    if (loggedInContainer) {
      loggedInContainer.classList.remove('hidden');
      loggedInContainer.classList.add('flex');
    }
    if (headerDesc) headerDesc.textContent = 'Sesión activa para administración.';
    // btn-nav-agregar se muestra solo si el usuario tiene rol de edición
    if (btnAgregar) btnAgregar.classList.remove('hidden');
    // btn-nav-agregar-proyecto y btn-nav-gestion-usuarios NUNCA se muestran en el
    // dashboard — esas acciones se hacen desde superadmin-home.html exclusivamente.
    // Sus clases 'hidden' en el HTML son suficientes; no se tocan aquí.

    // Anti-flash: revelar el main ahora que la sesión está validada
    if (mainEl) mainEl.classList.remove('opacity-0', 'pointer-events-none');

    renderLoggedUser();
    hideAuthStatus();
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.SuperadminsDB.getAll();
    if (document.body.classList.contains('login-page')) {
      initLoginPage();
    } else {
      protectDashboard();
      initDashboardPage();
    }
  });

  window.Auth = {
    getSession,
    saveSession,
    clearSession,
    protectDashboard
  };
})();
