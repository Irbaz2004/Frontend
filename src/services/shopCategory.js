// services/shopCategory.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: authHeaders(),
            ...options,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API call failed');
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// ===================== CATEGORY SERVICES =====================
// Changed from /admin/shop-categories to /shop-categories
export async function getCategories({ page = 1, limit = 10, search = '', is_active = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (is_active) params.append('is_active', is_active);
    
    return apiCall(`/shop-categories?${params}`);
}

export async function getCategoryById(id) {
    return apiCall(`/shop-categories/${id}`);
}

export async function createCategory(data) {
    return apiCall('/shop-categories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateCategory(id, data) {
    return apiCall(`/shop-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteCategory(id) {
    return apiCall(`/shop-categories/${id}`, {
        method: 'DELETE',
    });
}

export async function getAllCategoriesWithItems() {
    return apiCall('/shop-categories/with-items');
}

// ===================== KEY ITEMS SERVICES =====================
export async function getKeyItemsByCategory(categoryId) {
    return apiCall(`/shop-categories/${categoryId}/items`);
}

export async function createKeyItem(categoryId, data) {
    return apiCall(`/shop-categories/${categoryId}/items`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateKeyItem(id, data) {
    return apiCall(`/shop-categories/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteKeyItem(id) {
    return apiCall(`/shop-categories/items/${id}`, {
        method: 'DELETE',
    });
}

export async function bulkImportKeyItems(categoryId, items) {
    return apiCall(`/shop-categories/${categoryId}/items/bulk`, {
        method: 'POST',
        body: JSON.stringify({ items }),
    });
}

export default {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategoriesWithItems,
    getKeyItemsByCategory,
    createKeyItem,
    updateKeyItem,
    deleteKeyItem,
    bulkImportKeyItems,
};