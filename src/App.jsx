import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PantallaPrincipal from './Pantallas/PantallaPrincipal.jsx';
import Login from "./Pantallas/Login.jsx";
import Usuarios from "./Pantallas/Usuarios.jsx";
import Emisor from "./Pantallas/Emisor.jsx";
import Pagos from "./Pantallas/Pagos.jsx";
import Receptor from "./Pantallas/Receptor.jsx";
import Credenciales from "./Pantallas/Credenciales.jsx";
import Categorias from "./Pantallas/Categorias.jsx";
import FacturaEncabezado from "./Pantallas/FacturaEncabezado.jsx";
import FacturaDetalles from "./Pantallas/FacturaDetalles.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
    <Routes>
 
      <Route path="/" element={<FacturaDetalles />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
