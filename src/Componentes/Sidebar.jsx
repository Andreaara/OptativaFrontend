import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { alertaCerrarSesion } from "../Utils/Alerts.js";


const navItems = [
    { label: "Facturas", icon: "receipt_long", path: "/Pantallas/Facturas" },
    { label: "Detalles", icon: "list_alt", path: "/Pantallas/Detalles" },
    { label: "Servicios", icon: "design_services", path: "/Pantallas/PantallaPrincipal" },
    { label: "Usuarios", icon: "group", path: "/Pantallas/Usuarios" },
    { label: "Receptor", icon: "design_services", path: "/Pantallas/Receptor" },
    { label: "Emisor", icon: "design_services", path: "/Pantallas/Emisor" },
    { label: "Pagos", icon: "category", path: "/Pantallas/Pagos" },
    { label: "Credenciales", icon: "key", path: "/Pantallas/Credenciales" },
    { label: "Categorías", icon: "category", path: "/Pantallas/Categorias" },
];

export default function Sidebar() {
    const [colapsado, setColapsado] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        const resultado = await alertaCerrarSesion();

        if (resultado.isConfirmed) {
            localStorage.clear();
            navigate("/", { replace: true });
        }
    };

    return (
        <aside className={`sidebar${colapsado ? " colapsado" : ""}`}>
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <span className="material-symbols-outlined logo-icono">dashboard</span>
                    {!colapsado && <span className="brand-nombre">MI APP</span>}
                </div>

                <button
                    type="button"
                    className="btn-icono btn-icono--neutro sidebar-toggle"
                    onClick={() => setColapsado((prev) => !prev)}
                    aria-label={colapsado ? "Expandir menú" : "Colapsar menú"}
                >
                    <span className="material-symbols-outlined">
                        {colapsado ? "chevron_right" : "chevron_left"}
                    </span>
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ label, icon, path }) => (
                    <NavLink
                        key={path}
                        to={path}
                        title={colapsado ? label : undefined}
                        className={({ isActive }) => `nav-item${isActive ? " activo" : ""}`}
                    >
                        <span className="material-symbols-outlined">{icon}</span>
                        {!colapsado && <span className="nav-label">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    type="button"
                    className="nav-item nav-item--logout"
                    onClick={handleLogout}
                    title={colapsado ? "Cerrar sesión" : undefined}
                >
                    <span className="material-symbols-outlined">logout</span>
                    {!colapsado && <span className="nav-label">Cerrar sesión</span>}
                </button>
            </div>
        </aside>
    );
}