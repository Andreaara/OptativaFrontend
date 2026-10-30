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

import ProtectedRoutes, { estaAutenticado } from "./Routes/ProtectedRoutes.jsx";
import Layout from "./Componentes/Layout.jsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Pública: si ya hay sesión, salta directo a Facturas */}
          <Route
              path="/"
              element={
                estaAutenticado()
                    ? <Navigate to="/Pantallas/Facturas" replace />
                    : <Login />
              }
          />

          {/* Protegidas: ProtectedRoute valida sesión, Layout pone el sidebar */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<Layout />}>
              <Route path="/Pantallas/Facturas" element={<FacturaEncabezado />} />
              <Route path="/Pantallas/Detalles" element={<FacturaDetalles />} />
              <Route path="/Pantallas/PantallaPrincipal" element={<PantallaPrincipal />} />
              <Route path="/Pantallas/Usuarios" element={<Usuarios />} />
              <Route path="/Pantallas/Receptor" element={<Receptor />} />
              <Route path="/Pantallas/Emisor" element={<Emisor />} />
              <Route path="/Pantallas/Pagos" element={<Pagos />} />
              <Route path="/Pantallas/Credenciales" element={<Credenciales />} />
              <Route path="/Pantallas/Categorias" element={<Categorias />} />
            </Route>
          </Route>

          {/* Cualquier otra ruta */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App