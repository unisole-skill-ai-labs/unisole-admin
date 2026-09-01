const TOKEN_KEY = 'unisole-admin:token';
const USER_KEY = 'unisole-admin:user';

export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('unisole-seo:token') ||
    localStorage.getItem('token')
  );
}

export function isAuthenticated() {
  return !!getToken();
}

export function getUser() {
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem('unisole-seo:user') ||
      localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getUserPhone() {
  const user = getUser();
  return user?.phone || localStorage.getItem('userPhone') || '';
}

export function getUserEmail() {
  const user = getUser();
  return user?.email || localStorage.getItem('userEmail') || '';
}

export function getUserName() {
  const user = getUser();
  return (
    user?.name ||
    localStorage.getItem('userName') ||
    (getUserPhone() ? `+91 ${getUserPhone()}` : '') ||
    (getUserEmail() ? getUserEmail().split('@')[0] : 'User')
  );
}

export function setAuthSession({ token, user }: { token?: string; user?: any }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('token', token);
    localStorage.setItem('unisole-seo:token', token);
  }
  if (user) {
    const serialized = JSON.stringify(user);
    localStorage.setItem(USER_KEY, serialized);
    localStorage.setItem('unisole-seo:user', serialized);
    localStorage.setItem('user', serialized);
    if (user.name) localStorage.setItem('userName', user.name);
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.phone) localStorage.setItem('userPhone', user.phone);
  }
  window.dispatchEvent(new Event('authChange'));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('unisole-seo:token');
  localStorage.removeItem('unisole-seo:user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhone');
  window.dispatchEvent(new Event('authChange'));
}
