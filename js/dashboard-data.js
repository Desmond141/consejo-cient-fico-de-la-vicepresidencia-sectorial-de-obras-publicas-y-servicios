(function () {
  const PROJECTS_KEY = 'obras_dashboard_projects';
  const USERS_KEY = 'obras_dashboard_users';

  function createId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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
        creadoEn: new Date().toISOString()
      }
    ];

    const stored = safeParse(PROJECTS_KEY, defaultProjects);
    if (!stored.length) {
      saveList(PROJECTS_KEY, defaultProjects);
      return [...defaultProjects];
    }

    return stored;
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
      creadoEn: payload.creadoEn || new Date().toISOString()
    };

    projects.push(project);
    saveProjects(projects);
    return project;
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

  function canManageUsers(session) {
    if (!session) return false;
    const normalizedName = (session.nombre || '').trim().toLowerCase();
    const normalizedUsername = (session.username || '').trim().toLowerCase();
    return session.rol === 'Superadmin' || normalizedName === 'gingerlin molina' || normalizedUsername === 'gingerlin.m';
  }

  window.DashboardData = {
    getProjects,
    saveProjects,
    createProject,
    getUsers,
    saveUsers,
    createUser,
    getProjectNameById,
    canManageUsers
  };
})();
