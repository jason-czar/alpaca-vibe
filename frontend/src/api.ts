const API_BASE = 'http://localhost:8000/api';

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function apiSignup(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function apiGet(path: string, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { 'token': token } : undefined
  });
  return res.json();
}

export async function apiPost(path: string, data: any, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'token': token } : {})
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function apiDelete(path: string, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: token ? { 'token': token } : undefined
  });
  return res.json();
} 