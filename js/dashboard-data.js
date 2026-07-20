(function () {
  const PROJECTS_KEY = 'obras_dashboard_projects';
  const USERS_KEY = 'obras_dashboard_users';
  const PROJECT_CHAPTERS_KEY = 'obras_dashboard_project_chapters';

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
    return projects.map(project => {
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
    const defaultProjects = [
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

    const stored = safeParse(PROJECTS_KEY, defaultProjects);
    const projects = stored.length ? ensureProjectCodes(stored) : [...defaultProjects];

    if (!stored.length || projects.some(project => !project.codigo)) {
      saveProjects(projects);
    }

    return projects;
  }

  function saveProjects(projects) {
    saveList(PROJECTS_KEY, projects);
    return projects;
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
    saveProjects(projects);
    return project;
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
    return safeParse(USERS_KEY, []);
  }

  function saveUsers(users) {
    saveList(USERS_KEY, users);
    return users;
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
    return user;
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
    return normalizedName === 'gingerlin molina' || normalizedUsername === 'gingerlin.m';
  }

  function canManageUsers(session) {
    return isGingerlinSession(session);
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
    getProjectNameById,
    getProjectChapters,
    saveProjectChapters,
    canManageUsers,
    canManageProjects,
    isGingerlinSession
  };
})();
