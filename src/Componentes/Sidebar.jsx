import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { alertaCerrarSesion } from "../Utils/Alerts.js";
import { obtenerRolActual } from "../Routes/Protectedroutes.jsx";

const navItems = [
    { label: "Facturas", icon: "receipt_long", path: "/Pantallas/Facturas", roles: ["ADMIN", "FACTURADOR", "AUDITOR"] },
    { label: "Detalles", icon: "list_alt", path: "/Pantallas/Detalles", roles: ["ADMIN", "FACTURADOR", "AUDITOR"] },
    { label: "Pagos", icon: "payments", path: "/Pantallas/Pagos", roles: ["ADMIN", "FACTURADOR", "AUDITOR"] },
    { label: "Servicios", icon: "design_services", path: "/Pantallas/PantallaPrincipal", roles: ["ADMIN", "FACTURADOR", "AUDITOR"] },
    { label: "Categorías", icon: "category", path: "/Pantallas/Categorias", roles: ["ADMIN", "FACTURADOR", "AUDITOR"] },
    { label: "Receptor", icon: "person_pin_circle", path: "/Pantallas/Receptor", roles: ["ADMIN", "FACTURADOR", "AUDITOR"] },
    { label: "Emisor", icon: "domain", path: "/Pantallas/Emisor", roles: ["ADMIN", "AUDITOR"] },
    { label: "Impuestos", icon: "percent", path: "/Pantallas/Impuestos", roles: ["ADMIN", "AUDITOR"] },
    { label: "Usuarios", icon: "group", path: "/Pantallas/Usuarios", roles: ["ADMIN"] },
    { label: "Credenciales", icon: "key", path: "/Pantallas/Credenciales", roles: ["ADMIN"] },
    { label: "Auditoría", icon: "policy", path: "/Pantallas/Auditoria", roles: ["ADMIN", "AUDITOR"] },
];

export default function Sidebar() {
    const [colapsado, setColapsado] = useState(false);
    const navigate = useNavigate();
    const rolActual = obtenerRolActual();

    const itemsVisibles = navItems.filter((item) => item.roles.includes(rolActual));

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
                    {!colapsado && (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className="brand-nombre">MI APP</span>
                            {rolActual && (
                                <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 600 }}>
                                    Rol: {rolActual}
                                </span>
                            )}
                        </div>
                    )}
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
                {itemsVisibles.map(({ label, icon, path }) => (
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