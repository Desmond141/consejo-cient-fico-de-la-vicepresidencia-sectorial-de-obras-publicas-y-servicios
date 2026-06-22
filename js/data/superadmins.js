(function() {
  const STORAGE_KEY = 'obras_dashboard_superadmins';

  // Si existe `window.LOCAL_SUPERADMINS` (archivo local git-ignored), se usará.
  const DEFAULT_SUPERADMINS = (window.LOCAL_SUPERADMINS && Array.isArray(window.LOCAL_SUPERADMINS) && window.LOCAL_SUPERADMINS.length)
    ? window.LOCAL_SUPERADMINS
    : [
      { id: 'sa1', nombre: 'Trino Baloa', username: 'Trino.B', email: 'trino.b@obras.gob.ve', rol: 'Superadmin', passwordHash: btoa('TrinoB123') },
      { id: 'sa2', nombre: 'Alexander Marin', username: 'Alexander.M', email: 'alexander.m@obras.gob.ve', rol: 'Superadmin', passwordHash: btoa('AlexanderM123') },
      { id: 'sa3', nombre: 'Kevinson Campos', username: 'Kevinson.C', email: 'kevinson.c@obras.gob.ve', rol: 'Superadmin', passwordHash: btoa('KevinsonC123') },
      { id: 'sa4', nombre: 'Gingerlin Molina', username: 'Gingerlin.M', email: 'gingerlin.m@obras.gob.ve', rol: 'Superadmin', passwordHash: btoa('GingerlinM123') },
      { id: 'sa5', nombre: 'Programador', username: 'Jonas', email: 'jonas@obras.gob.ve', rol: 'Programador', passwordHash: btoa('Jonasmanda1410') }
    ];

  function hash(value) {
    return btoa(value || '');
  }

  function saveAdmins(admins) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(admins));
  }

  function isAdminEntryValid(entry) {
    return entry &&
      typeof entry.email === 'string' &&
      typeof entry.passwordHash === 'string' &&
      typeof entry.username === 'string' &&
      typeof entry.nombre === 'string';
  }

  function isValidAdminsArray(admins) {
    return Array.isArray(admins) && admins.length > 0 && admins.every(isAdminEntryValid);
  }

  function loadAdmins() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAdmins(DEFAULT_SUPERADMINS);
      return [...DEFAULT_SUPERADMINS];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!isValidAdminsArray(parsed)) {
        throw new Error('Formato incorrecto');
      }
      return parsed;
    } catch (error) {
      saveAdmins(DEFAULT_SUPERADMINS);
      return [...DEFAULT_SUPERADMINS];
    }
  }

  function getAll() {
    return loadAdmins();
  }

  function findByCredential(credential) {
    if (!credential) return null;
    const normalized = credential.trim().toLowerCase();
    return loadAdmins().find(admin => {
      return admin.email.toLowerCase() === normalized || admin.username.toLowerCase() === normalized;
    }) || null;
  }

  function validateCredentials(credential, password) {
    const admin = findByCredential(credential);
    if (!admin) return null;
    return admin.passwordHash === hash(password) ? admin : null;
  }

  window.SuperadminsDB = {
    getAll,
    findByCredential,
    validateCredentials,
    saveAdmins,
    hash
  };
})();
