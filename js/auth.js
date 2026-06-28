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

  function saveSession(admin) {
    const session = {
      email: admin.email,
      nombre: admin.nombre,
      rol: admin.rol,
      loggedAt: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function redirectToLogin() {
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
  }

  function redirectToDashboard() {
    const pathname = window.location.pathname;
    if (pathname.endsWith('login.html') || pathname.endsWith('/')) {
      window.location.href = 'index.html';
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
        window.location.reload(); // Recargar para volver a la vista pública
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

    form.addEventListener('submit', event => {
      event.preventDefault();
      showAuthStatus('Validando credenciales de Usuario');
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
    const loginLink = document.getElementById('login-link-btn');
    const loggedInContainer = document.getElementById('logged-in-container');
    const btnAgregar = document.getElementById('btn-nav-agregar');
    const headerDesc = document.getElementById('header-description');

    if (!session) {
      // Estado público (no logueado)
      if (loginLink) loginLink.classList.remove('hidden');
      if (loggedInContainer) loggedInContainer.classList.add('hidden');
      if (btnAgregar) btnAgregar.classList.add('hidden');
      if (headerDesc) headerDesc.textContent = 'Vista pública del estado del proyecto.';
    } else {
      // Estado logueado
      if (loginLink) loginLink.classList.add('hidden');
      if (loggedInContainer) {
        loggedInContainer.classList.remove('hidden');
        loggedInContainer.classList.add('flex');
      }
      if (headerDesc) headerDesc.textContent = 'Sesión activa para administración.';
      renderLoggedUser();

      // Habilitar opción de agregar dato si es superadmin
      if (session.rol === 'Superadmin' && btnAgregar) {
        btnAgregar.classList.remove('hidden');
      }
    }
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
