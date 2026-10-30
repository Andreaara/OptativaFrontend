import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
    return (
        <div className="layout-app">
            <Sidebar />
            <main className="layout-contenido">
                <Outlet />
            </main>
        </div>
    );
}

/* Uso en el router:
<Route element={<Layout />}>
    <Route path="/usuarios" element={<Usuarios />} />
    <Route path="/credenciales" element={<Credenciales />} />
    <Route path="/categorias" element={<Categorias />} />
    <Route path="/facturas" element={<Facturas />} />
    <Route path="/detalles" element={<Detalles />} />
    <Route path="/servicios" element={<Servicios />} />
</Route>
*/