import { Navigate, Outlet, useLocation } from "react-router-dom";

const estaAutenticado = () => Boolean(localStorage.getItem("token"));

const obtenerRolActual = () => {
    const rolDirecto = localStorage.getItem("rol");
    if (rolDirecto) return rolDirecto.toUpperCase();

    try {
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        if (usuario.rol) return String(usuario.rol).toUpperCase();
    } catch {
        // Ignorar si no es JSON válido
    }

    return "";
};

export default function ProtectedRoutes({ allowedRoles }) {
    const location = useLocation();
    const rol = obtenerRolActual();

    if (!estaAutenticado()) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    if (allowedRoles) {
        const rolesPermitidos = allowedRoles.map((r) => r.toUpperCase());
        if (!rolesPermitidos.includes(rol)) {
            return <Navigate to="/Pantallas/Facturas" replace />;
        }
    }

    return <Outlet />;
}

export { estaAutenticado, obtenerRolActual };