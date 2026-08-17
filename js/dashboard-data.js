(function () {
  const PROJECTS_KEY = 'obras_dashboard_projects';
  const USERS_KEY = 'obras_dashboard_users';
  const PROJECT_CHAPTERS_KEY = 'obras_dashboard_project_chapters';
  const PROJECTS_API_URL = '/api/proyectos';
  const USERS_API_URL = '/api/usuarios';

  let projectsCache = null;
  let usersCache = null;
  let hasHydratedProjects = false;
  let hasHydratedUsers = false;

  function createId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeProjectCode(value) {
    return (value || '').toString().trim().toUpperCase();
  }

  function generateProjectCode(existingCodes = new Set()) {
    const letters = () => Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    const numbers = () => Math.floor(1000 + Math.random() * 9000);
    let code;
    let attempts = 0;
    do {
      code = `${letters()}-${numbers()}`;
      attempts += 1;
      if (attempts > 20) {
        break;
      }
    } while (existingCodes.has(code));
    return code;
  }

  function ensureProjectCodes(projects) {
    const usedCodes = new Set();
    return (Array.isArray(projects) ? projects : []).map(project => {
      const codigo = normalizeProjectCode(project.codigo);
      if (codigo && !usedCodes.has(codigo)) {
        usedCodes.add(codigo);
        return { ...project, codigo };
      }
      const newCode = generateProjectCode(usedCodes);
      usedCodes.add(newCode);
      return { ...project, codigo: newCode };
    });
  }

  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (error) {
      return fallback;
    }
  }

  function saveList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getDefaultProjects() {
    return [
      {
        id: 'project-las-delicias',
        nombre: 'Remodelación integral Plaza Las Delicias Caracas',
        descripcion: 'Proyecto principal de seguimiento del avance de obra.',
        progreso: 60,
        estado: 'En ejecución',
        creadoPor: 'Sistema',
        creadoEn: new Date().toISOString(),
        codigo: generateProjectCode()
      }
    ];
  }

  function notifyDataUpdated() {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('dashboard-data-updated'));
      } catch (error) {
        console.warn('No se pudo notificar actualización de datos:', error);
      }
    }
  }

  function persistProjectsToStorage(projects) {
    saveList(PROJECTS_KEY, projects);
    projectsCache = projects;
    notifyDataUpdated();
    return projects;
  }

  function persistUsersToStorage(users) {
    saveList(USERS_KEY, users);
    usersCache = users;
    notifyDataUpdated();
    return users;
  }

  function syncProjectsToServer(projects) {
    if (typeof fetch !== 'function') return Promise.resolve(projects);
    return fetch(PROJECTS_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projects)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Sync projects failed: ${response.status} ${response.statusText}`);
        }
        return projects;
      })
      .catch(error => {
        console.warn('No fue posible sincronizar proyectos con el servidor:', error);
        return projects;
      });
  }

  function syncUsersToServer(users) {
    if (typeof fetch !== 'function') return Promise.resolve(users);
    return fetch(USERS_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Sync users failed: ${response.status} ${response.statusText}`);
        }
        return users;
      })
      .catch(error => {
        console.warn('No fue posible sincronizar usuarios con el servidor:', error);
        return users;
      });
  }

  function hydrateProjectsFromServer() {
    if (hasHydratedProjects || typeof fetch !== 'function') {
      return Promise.resolve(projectsCache || []);
    }

    hasHydratedProjects = true;
    return fetch(PROJECTS_API_URL)
      .then(response => {
        if (!response.ok) throw new Error(`No se pudo leer proyectos del servidor: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const normalized = ensureProjectCodes(Array.isArray(data) ? data : []);
        if (normalized.length) {
          persistProjectsToStorage(normalized);
          return normalized;
        }

        const localProjects = projectsCache || safeParse(PROJECTS_KEY, getDefaultProjects());
        return persistProjectsToStorage(ensureProjectCodes(Array.isArray(localProjects) ? localProjects : getDefaultProjects()));
      })
      .catch(error => {
        console.warn('Usando datos locales para proyectos:', error);
        const localProjects = projectsCache || safeParse(PROJECTS_KEY, getDefaultProjects());
        return persistProjectsToStorage(ensureProjectCodes(Array.isArray(localProjects) ? localProjects : getDefaultProjects()));
      });
  }

  function hydrateUsersFromServer() {
    if (hasHydratedUsers || typeof fetch !== 'function') {
      return Promise.resolve(usersCache || []);
    }

    hasHydratedUsers = true;
    return fetch(USERS_API_URL)
      .then(response => {
        if (!response.ok) throw new Error(`No se pudo leer usuarios del servidor: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const normalized = Array.isArray(data) ? data : [];
        if (normalized.length) {
          persistUsersToStorage(normalized);
          return normalized;
        }

        const localUsers = usersCache || safeParse(USERS_KEY, []);
        return persistUsersToStorage(Array.isArray(localUsers) ? localUsers : []);
      })
      .catch(error => {
        console.warn('Usando datos locales para usuarios:', error);
        const localUsers = usersCache || safeParse(USERS_KEY, []);
        return persistUsersToStorage(Array.isArray(localUsers) ? localUsers : []);
      });
  }

  function createUser(payload) {
    const users = getUsers();
    const user = {
      id: createId('user'),
      nombre: payload.nombre || 'Usuario',
      username: payload.username || payload.email || 'usuario',
      email: payload.email || '',
      rol: payload.rol || 'Usuario',
      passwordHash: payload.passwordHash || btoa(payload.password || ''),
      proyectoId: payload.proyectoId || '',
      proyectoNombre: payload.proyectoNombre || '',
      proyectoCodigo: payload.proyectoCodigo || '',
      creadoPor: payload.creadoPor || 'Superadmin',
      creadoEn: payload.creadoEn || new Date().toISOString()
    };

    users.push(user);
    saveUsers(users);

    if (typeof fetch === 'function') {
      fetch(USERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(error => {
        console.warn('No se pudo enviar usuario al servidor, se guardará localmente:', error);
      });
    }

    return user;
  }

  function updateUser(userId, payload) {
    const users = getUsers();
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) return null;

    const updated = {
      ...users[index],
      ...payload,
      passwordHash: payload.passwordHash || users[index].passwordHash
    };
    users[index] = updated;
    saveUsers(users);

    if (typeof fetch === 'function') {
      fetch(`${USERS_API_URL}/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(error => {
        console.warn('No se pudo actualizar usuario en servidor:', error);
      });
    }

    return updated;
  }

  function deleteUser(userId) {
    const users = getUsers().filter(user => user.id !== userId);
    saveUsers(users);

    if (typeof fetch === 'function') {
      fetch(`${USERS_API_URL}/${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      }).catch(error => {
        console.warn('No se pudo eliminar usuario en servidor:', error);
      });
    }

    return users;
  }

  function getProjectChaptersMap() {
    const stored = safeParse(PROJECT_CHAPTERS_KEY, {});
    return typeof stored === 'object' && stored !== null ? stored : {};
  }

  function getProjectChaptersFromStore(projectId) {
    const map = getProjectChaptersMap();
    const chapters = map[projectId];
    return Array.isArray(chapters) ? chapters : [];
  }

  function saveProjectChaptersToStore(projectId, chapters) {
    const map = getProjectChaptersMap();
    map[projectId] = Array.isArray(chapters) ? chapters : [];
    saveList(PROJECT_CHAPTERS_KEY, map);
    return chapters;
  }

  function removeProjectChapters(projectId) {
    const map = getProjectChaptersMap();
    if (map[projectId]) {
      delete map[projectId];
      saveList(PROJECT_CHAPTERS_KEY, map);
    }
  }

  function getProjects() {
    if (!projectsCache) {
      const stored = safeParse(PROJECTS_KEY, getDefaultProjects());
      const normalized = ensureProjectCodes(Array.isArray(stored) ? stored : getDefaultProjects());
      persistProjectsToStorage(normalized);
    }

    hydrateProjectsFromServer();
    return projectsCache || [];
  }

  function saveProjects(projects) {
    const normalized = ensureProjectCodes(Array.isArray(projects) ? projects : []);
    persistProjectsToStorage(normalized);
    return syncProjectsToServer(normalized).catch(error => {
      console.warn('Error sincronizando proyectos con el servidor:', error);
      return normalized;
    });
  }

  function createProject(payload) {
    const projects = getProjects();
    const project = {
      id: createId('project'),
      nombre: payload.nombre || 'Proyecto sin nombre',
      descripcion: payload.descripcion || 'Sin descripción',
      progreso: Number(payload.progreso) || 0,
      estado: payload.estado || (Number(payload.progreso) >= 100 ? 'Completado' : 'En ejecución'),
      creadoPor: payload.creadoPor || 'Superadmin',
      creadoEn: payload.creadoEn || new Date().toISOString(),
      codigo: generateProjectCode()
    };

    projects.push(project);
    return saveProjects(projects).then(() => project);
  }

  function deleteProject(projectId) {
    const projects = getProjects().filter(project => project.id !== projectId);
    const result = projects;
    return saveProjects(projects).then(() => result);
  }

  function getProjectById(projectId) {
    return getProjects().find(project => project.id === projectId) || null;
  }

  function updateProjectCode(projectId, newCode) {
    const projects = getProjects();
    const project = projects.find(project => project.id === projectId);
    if (!project) return null;
    project.codigo = newCode && typeof newCode === 'string' && newCode.trim() ? newCode.trim() : generateProjectCode();
    saveProjects(projects);
    return project;
  }

  function canManageProjects(session) {
    return !!session && (
      session.rol === 'Superadmin' ||
      session.rol === 'Programador' ||
      isGingerlinSession(session)
    );
  }

  function clearProjectFromUsers(projectId) {
    const users = getUsers();
    const updated = users.map(user => {
      if (user.proyectoId === projectId) {
        return {
          ...user,
          proyectoId: '',
          proyectoNombre: '',
          proyectoCodigo: ''
        };
      }
      return user;
    });
    saveUsers(updated);
    return updated;
  }

  function getUsers() {
    if (!usersCache) {
      const stored = safeParse(USERS_KEY, []);
      persistUsersToStorage(Array.isArray(stored) ? stored : []);
    }

    hydrateUsersFromServer();
    return usersCache || [];
  }

  function saveUsers(users) {
    const normalized = Array.isArray(users) ? users : [];
    persistUsersToStorage(normalized);
    return syncUsersToServer(normalized).catch(error => {
      console.warn('Error sincronizando usuarios con el servidor:', error);
      return normalized;
    });
  }

  function getProjectNameById(projectId) {
    const projects = getProjects();
    const found = projects.find(project => project.id === projectId);
    return found ? found.nombre : '';
  }

  function deleteProject(projectId) {
    const projects = getProjects().filter(project => project.id !== projectId);
    saveProjects(projects);
    removeProjectChapters(projectId);
    return projects;
  }

  function getProjectChapters(projectId) {
    return getProjectChaptersFromStore(projectId);
  }

  function saveProjectChapters(projectId, chapters) {
    return saveProjectChaptersToStore(projectId, chapters);
  }

  function isGingerlinSession(session) {
    if (!session) return false;
    const normalizedName = (session.nombre || '').trim().toLowerCase();
    const normalizedUsername = (session.username || '').trim().toLowerCase();
    return normalizedName === 'gingerlin molina' || normalizedUsername === 'gingerlin.m' ||
      normalizedName === 'kevinson campos' || normalizedUsername === 'kevinson.c';
  }

  function canManageUsers(session) {
    if (!session) return false;
    const rol = (session.rol || '').trim().toLowerCase();
    const nombre = (session.nombre || '').trim().toLowerCase();
    const username = (session.username || '').trim().toLowerCase();

    if (rol === 'superadmin' || rol === 'programador') return true;
    if (nombre === 'gingerlin molina' || nombre === 'kevinson campos') return true;
    if (username === 'gingerlin.m' || username === 'kevinson.c' || username === 'jonas') return true;
    return false;
  }

  function bootstrapRemoteSync() {
    return Promise.all([hydrateProjectsFromServer(), hydrateUsersFromServer()]);
  }

  // ──────────────── Nodos Críticos ────────────────

  const CRITICAL_NODES_API = '/api/nodos-criticos';
  const CRITICAL_NODES_KEY = 'obras_dashboard_critical_nodes';

  function getCriticalNodesLocal(projectId) {
    try {
      const raw = localStorage.getItem(CRITICAL_NODES_KEY);
      const map = raw ? JSON.parse(raw) : {};
      return Array.isArray(map[projectId]) ? map[projectId] : [];
    } catch (e) {
      return [];
    }
  }

  function saveCriticalNodesLocal(projectId, nodes) {
    try {
      const raw = localStorage.getItem(CRITICAL_NODES_KEY);
      const map = raw ? JSON.parse(raw) : {};
      map[projectId] = Array.isArray(nodes) ? nodes : [];
      localStorage.setItem(CRITICAL_NODES_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('No se pudo guardar nodos críticos localmente:', e);
    }
  }

  async function getCriticalNodes(projectId) {
    if (!projectId) return [];
    try {
      const res = await fetch(`${CRITICAL_NODES_API}?projectId=${encodeURIComponent(projectId)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const nodes = Array.isArray(data) ? data : [];
      saveCriticalNodesLocal(projectId, nodes);
      return nodes;
    } catch (err) {
      console.warn('No se pudo leer nodos críticos del servidor, usando fallback local:', err);
      return getCriticalNodesLocal(projectId);
    }
  }

  async function addCriticalNode(projectId, { titulo, descripcion }) {
    if (!projectId || !titulo) return null;
    const payload = { projectId, titulo: String(titulo).trim(), descripcion: descripcion || '' };
    try {
      const res = await fetch(CRITICAL_NODES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      // Refrescar caché local desde servidor
      await getCriticalNodes(projectId);
      return data.nodo || null;
    } catch (err) {
      console.warn('No se pudo crear nodo crítico en servidor, guardando localmente:', err);
      const local = getCriticalNodesLocal(projectId);
      const nodo = {
        id: `local-${Math.random().toString(36).slice(2, 10)}`,
        projectId,
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        fecha: new Date().toISOString()
      };
      local.unshift(nodo);
      saveCriticalNodesLocal(projectId, local);
      return nodo;
    }
  }

  async function deleteCriticalNode(nodeId) {
    try {
      const res = await fetch(`${CRITICAL_NODES_API}/${encodeURIComponent(nodeId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return true;
    } catch (err) {
      console.warn('No se pudo eliminar nodo crítico en servidor:', err);
      return false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapRemoteSync);
  } else {
    bootstrapRemoteSync();
  }

  window.DashboardData = {
    getProjects,
    saveProjects,
    createProject,
    deleteProject,
    getProjectById,
    updateProjectCode,
    getUsers,
    saveUsers,
    createUser,
    updateUser,
    deleteUser,
    getProjectNameById,
    getProjectChapters,
    saveProjectChapters,
    canManageUsers,
    canManageProjects,
    isGingerlinSession,
    getCriticalNodes,
    addCriticalNode,
    deleteCriticalNode,
    hydrateRemoteData: bootstrapRemoteSync
  };
})();
