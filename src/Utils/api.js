export const API_RDS_URL = import.meta.env.VITE_API_RDS_URL;

export async function apiFetch(ruta, opciones = {}) {
    if (!API_RDS_URL) {
        throw new Error('La URL de la API (VITE_API_RDS_URL) no está configurada en el archivo .env');
    }

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

    const textoRespuesta = await res.text();
    let data = null;

    if (textoRespuesta) {
        try {
            data = JSON.parse(textoRespuesta);
        } catch {
            if (!res.ok) {
                throw new Error(`Error del servidor (${res.status}): respuesta inesperada.`);
            }
            return textoRespuesta;
        }
    }

    if (!res.ok) {
        throw new Error(data?.error || data?.message || `Error ${res.status}`);
    }

    return data;
}