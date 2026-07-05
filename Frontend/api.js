const BASE_URL = 'http://localhost:4000';

// --- Token management ---
function saveToken(token) { localStorage.setItem('aayu_token', token); }
function getToken()       { return localStorage.getItem('aayu_token'); }
function clearToken()     { localStorage.removeItem('aayu_token'); }
function isLoggedIn()     { return !!getToken(); }

// --- Core fetch wrapper ---
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE_URL + path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// --- Auth ---
async function login(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveToken(data.token);
  return data;
}

function logout() { clearToken(); }

// --- Data ---
function getLeads()           { return apiFetch('/api/leads'); }
function createLead(data)     { return apiFetch('/api/leads',  { method: 'POST', body: JSON.stringify(data) }); }
function getTrades()          { return apiFetch('/api/trades'); }
function getTrips()           { return apiFetch('/api/trips');  }
function getAlerts()          { return apiFetch('/api/alerts'); }
