import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button';

// URLs de tus API Gateways de AWS
const API_URLS = {
  POST: 'https://y4kx0y3xqi.execute-api.us-east-1.amazonaws.com',
  PUT: 'https://h35bqwysm2.execute-api.us-east-1.amazonaws.com',
  GET: 'https://fjnpuuui26.execute-api.us-east-1.amazonaws.com',
  DELETE: 'https://wmf7zl0p80.execute-api.us-east-1.amazonaws.com',
};

export default function PantallaServiciosAWS() {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorApi, setErrorApi] = useState(null);

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Formulario alineado a los campos obligatorios de tu Lambda (servicio_id, nombre, categoria_id)
  const [formData, setFormData] = useState({
    servicio_id: '',
    nombre: '',
    categoria_id: '',
  });

  // 1. OBTENER SERVICIOS (GET)
  const cargarServicios = async () => {
    setCargando(true);
    setErrorApi(null);
    try {
      const response = await fetch(API_URLS.GET);
      if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron cargar los servicios`);
      const data = await response.json();
      setServicios(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // Abrir modal para Crear
  const handleAbrirCrear = () => {
    setServicioSeleccionado(null);
    setFormData({ servicio_id: Date.now().toString(), nombre: '', categoria_id: '' });
    setModalFormOpen(true);
  };

  // Abrir modal para Editar
  const handleAbrirEditar = (servicio) => {
    setServicioSeleccionado(servicio);
    setFormData({
      servicio_id: servicio.servicio_id,
      nombre: servicio.nombre,
      categoria_id: servicio.categoria_id,
    });
    setModalFormOpen(true);
  };

  // Abrir modal para Ver
  const handleAbrirVer = (servicio) => {
    setServicioSeleccionado(servicio);
    setModalVerOpen(true);
  };

  // 2. CREAR (POST) O ACTUALIZAR (PUT)
  const handleGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorApi(null);

    const esEdicion = !!servicioSeleccionado;
    const url = esEdicion ? API_URLS.PUT : API_URLS.POST;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Error al procesar la solicitud');
      }

      setModalFormOpen(false);
      cargarServicios(); // Recargar la lista desde AWS
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setCargando(false);
    }
  };

  // 3. ELIMINAR (DELETE)
  const handleEliminar = async (servicio_id) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el servicio ${servicio_id}?`)) return;

    setCargando(true);
    setErrorApi(null);

    try {
      const response = await fetch(`${API_URLS.DELETE}?servicio_id=${servicio_id}`, {
        method: 'DELETE',
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'No se pudo eliminar el servicio');
      }

      cargarServicios(); // Recargar tabla
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setCargando(false);
    }
  };

  const serviciosFiltrados = servicios.filter(s =>
    s.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.servicio_id?.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.categoria_id?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestión de Servicios (AWS DynamoDB)</h2>
        <AddButton onClick={handleAbrirCrear}>+ Nuevo Servicio</AddButton>
      </div>

      {/* Alertas / Mensajes de error */}
      {errorApi && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>
          ⚠️ {errorApi}
        </div>
      )}

      

      {/* Tabla de Servicios */}
      {cargando && <p style={{ textAlign: 'center' }}>Cargando datos desde AWS...</p>}

      {!cargando && (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ padding: '12px' }}>ID Servicio</th>
              <th style={{ padding: '12px' }}>Nombre</th>
              <th style={{ padding: '12px' }}>ID Categoría</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {serviciosFiltrados.length > 0 ? (
              serviciosFiltrados.map((s) => (
                <tr key={s.servicio_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.servicio_id}</td>
                  <td style={{ padding: '12px' }}>{s.nombre}</td>
                  <td style={{ padding: '12px' }}>{s.categoria_id}</td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAbrirVer(s)} style={{ padding: '6px 12px', cursor: 'pointer' }}>👁️ Ver</button>
                    <EditButton onClick={() => handleAbrirEditar(s)} />
                    <DeleteButton onClick={() => handleEliminar(s.servicio_id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No se encontraron servicios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* MODAL CREAR / EDITAR */}
      {modalFormOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{servicioSeleccionado ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
            <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              
              <Input 
                label="ID Servicio" 
                value={formData.servicio_id} 
                onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })} 
                disabled={!!servicioSeleccionado} // No se debe editar el ID en DynamoDB si es la clave primaria
                required 
              />

              <Input 
                label="Nombre del Servicio" 
                value={formData.nombre} 
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                required 
              />

              <Input 
                label="ID Categoría" 
                value={formData.categoria_id} 
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} 
                required 
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalFormOpen(false)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <AddButton type="submit">
                  {servicioSeleccionado ? 'Guardar Cambios' : 'Crear en AWS'}
                </AddButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VISUALIZAR */}
      {modalVerOpen && servicioSeleccionado && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Detalle del Servicio</h3>
            <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p><strong>ID Servicio:</strong> {servicioSeleccionado.servicio_id}</p>
              <p><strong>Nombre:</strong> {servicioSeleccionado.nombre}</p>
              <p><strong>ID Categoría:</strong> {servicioSeleccionado.categoria_id}</p>
            </div>
            <button onClick={() => setModalVerOpen(false)} style={{ width: '100%', padding: '8px', cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px'
  }
};