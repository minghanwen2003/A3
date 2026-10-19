const API_BASE = window.APP_CONFIG?.API_BASE || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || payload.message || `Request failed (${response.status})`);
  return payload;
}

const API = {
  listEvents: (params = '') => request(`/events${params}`),
  getEvent: (id) => request(`/events/${encodeURIComponent(id)}`),
  getCategories: () => request('/categories'),
  register: (data) => request('/registrations', { method: 'POST', body: JSON.stringify(data) })
};

function formatDate(value) { return value ? new Date(value.replace(' ', 'T')).toLocaleString() : 'Date to be confirmed'; }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
