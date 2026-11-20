import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Login from "./Auth/Login.jsx";
import PantallaPrincipal from './Pantallas/PantallaPrincipal.jsx';
import Usuarios from "./Pantallas/Usuarios.jsx";
import Emisor from "./Pantallas/Emisor.jsx";
import Pagos from "./Pantallas/Pagos.jsx";
import Credenciales from "./Pantallas/Credenciales.jsx";
import Categorias from "./Pantallas/Categorias.jsx";
import FacturaEncabezado from "./Pantallas/FacturaEncabezado.jsx";
import FacturaDetalles from "./Pantallas/FacturaDetalles.jsx";
import Receptor from "./Pantallas/Receptor.jsx";
import Impuestos from "./Pantallas/Impuestos.jsx";
import LogsAuditoria from "./Pantallas/LogsAuditoria.jsx";

import ProtectedRoutes, { estaAutenticado } from "./Routes/Protectedroutes.jsx";
import Layout from "./Componentes/Layout.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route
              path="/"
              element={
                estaAutenticado()
                    ? <Navigate to="/Pantallas/Facturas" replace />
                    : <Login />
              }
          />

          {/* Rutas operativas: ADMIN, FACTURADOR y AUDITOR */}
          <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'FACTURADOR', 'AUDITOR']} />}>
            <Route element={<Layout />}>
              <Route path="/Pantallas/Facturas" element={<FacturaEncabezado />} />
              <Route path="/Pantallas/Detalles" element={<FacturaDetalles />} />
              <Route path="/Pantallas/Pagos" element={<Pagos />} />
              <Route path="/Pantallas/PantallaPrincipal" element={<PantallaPrincipal />} />
              <Route path="/Pantallas/Categorias" element={<Categorias />} />
              <Route path="/Pantallas/Receptor" element={<Receptor />} />
            </Route>
          </Route>

          {/* Rutas fiscales / configuración: ADMIN y AUDITOR */}
          <Route element={<ProtectedRoutes allowedRoles={['ADMIN', 'AUDITOR']} />}>
            <Route element={<Layout />}>
              <Route path="/Pantallas/Emisor" element={<Emisor />} />
              <Route path="/Pantallas/Impuestos" element={<Impuestos />} />
              <Route path="/Pantallas/Auditoria" element={<LogsAuditoria />} />
            </Route>
          </Route>

          {/* Rutas de seguridad: Solo ADMIN */}
          <Route element={<ProtectedRoutes allowedRoles={['ADMIN']} />}>
            <Route element={<Layout />}>
              <Route path="/Pantallas/Usuarios" element={<Usuarios />} />
              <Route path="/Pantallas/Credenciales" element={<Credenciales />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App