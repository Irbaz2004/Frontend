// admin.js — Admin specific API calls

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export async function getAdminStats() {
    const response = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch stats');
    return result;
}

export async function getAllUsers() {
    const response = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch users');
    return result.users || [];
}

export async function getPendingShops() {
    const response = await fetch(`${API_BASE}/admin/pending-shops`, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch pending shops');
    return result.shops || [];
}

export async function verifyShop(shopId, action) {
    const response = await fetch(`${API_BASE}/admin/verify-shop`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ shopId, action }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to verify shop');
    return result;
}

export async function getAllAdminJobs() {
    const response = await fetch(`${API_BASE}/admin/jobs`, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch jobs');
    return result.jobs || [];
}

export async function getAllShops() {
    const response = await fetch(`${API_BASE}/admin/shops`, { headers: authHeaders() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch shops');
    return result.shops || [];
}
