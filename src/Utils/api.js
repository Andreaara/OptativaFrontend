export const API_RDS_URL = 'https://zdqh4zqlfl.execute-api.us-east-1.amazonaws.com';

export async function apiFetch(ruta, opciones = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opciones.headers || {}),
    };

    const res = await fetch(`${API_RDS_URL}${ruta}`, {
        ...opciones,
        headers,
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
}