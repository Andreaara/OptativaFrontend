import { Navigate, Outlet, useLocation } from "react-router-dom";

const estaAutenticado = () => Boolean(localStorage.getItem("token"));

export default function ProtectedRoutes() {
    const location = useLocation();

    if (!estaAutenticado()) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export { estaAutenticado };