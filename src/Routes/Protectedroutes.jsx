import { Navigate, Outlet, useLocation } from "react-router-dom";

const estaAutenticado = () => Boolean(localStorage.getItem("token"));

export default function ProtectedRoutes({ allowedRoles }) {
    const location = useLocation();
    const rol = localStorage.getItem("rol");

    if (!estaAutenticado()) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    if (allowedRoles && !allowedRoles.includes(rol)) {
        return <Navigate to="/dashboard" replace />; 
    }

    return <Outlet />;
}

export { estaAutenticado };