import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import { limpiarTexto, validarTexto } from '../Utils/validaciones.js';
import {
  alertaExito,
  alertaError,
  alertaCamposCaracteres,
  alertaCamposVacios,
  confirmarEliminar,
  toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

const API_URLS = {
  POST: 'https://y4kx0y3xqi.execute-api.us-east-1.amazonaws.com',
  PUT: 'https://h35bqwysm2.execute-api.us-east-1.amazonaws.com',
  GET: 'https://fjnpuuui26.execute-api.us-east-1.amazonaws.com',
  DELETE: 'https://wmf7zl0p80.execute-api.us-east-1.amazonaws.com',
};

const getHeadersDynamo = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  const validador = import.meta.env.VITE_API_VALIDATOR;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (validador) headers['x-validador'] = validador;
  return headers;
};

export default function PantallaServiciosAWS() {
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const rol = obtenerRolActual();

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    servicio_id: '',
    nombre: '',
    categoria_id: '',
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resServ, dataCats] = await Promise.all([
        fetch(API_URLS.GET, { headers: getHeadersDynamo() }),
        apiFetch('/categorias').catch(() => []),
      ]);

      if (!resServ.ok) {
        throw new Error(`Error ${resServ.status}: No se pudieron cargar los servicios`);
      }

      const dataServ = await resServ.json();
      setServicios(Array.isArray(dataServ) ? dataServ : []);
      setCategorias(Array.isArray(dataCats) ? dataCats : []);
    } catch (err) {
      alertaError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrirCrear = () => {
    setServicioSeleccionado(null);
    setFormData({
      servicio_id: `SERV-${Math.floor(100 + Math.random() * 900)}`,
      nombre: '',
      categoria_id: categorias.length > 0 ? categorias[0].categoria_id : '',
    });
    setModalFormOpen(true);
  };

  const handleAbrirEditar = (servicio) => {
    setServicioSeleccionado(servicio);
    setFormData({
      servicio_id: servicio.servicio_id,
      nombre: servicio.nombre || '',
      categoria_id: servicio.categoria_id || (categorias[0]?.categoria_id ?? ''),
    });
    setModalFormOpen(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (rol !== 'ADMIN') {
      alertaError('Solo el rol ADMIN puede administrar el catálogo de servicios.');
      return;
    }

    const idLimpio = limpiarTexto(formData.servicio_id).toUpperCase();
    if (!idLimpio || !/^[A-Z0-9-]{2,25}$/.test(idLimpio)) {
      alertaCamposCaracteres('El ID Servicio debe tener formato alfanumérico válido (ej. SERV-101).');
      return;
    }

    const nombreValido = validarTexto(formData.nombre, 'Nombre del Servicio', {
      min: 3,
      max: 100,
    });
    if (!nombreValido) return;

    if (!formData.categoria_id) {
      alertaCamposVacios();
      return;
    }

    setCargando(true);
    const esEdicion = !!servicioSeleccionado;
    const url = esEdicion ? API_URLS.PUT : API_URLS.POST;
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: getHeadersDynamo(),
        body: JSON.stringify({
          servicio_id: idLimpio,
          nombre: nombreValido,
          categoria_id: formData.categoria_id,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Error al procesar la solicitud');
      }

      setModalFormOpen(false);
      await alertaExito(
          esEdicion
              ? 'Servicio actualizado en DynamoDB.'
              : 'Servicio registrado en DynamoDB.'
      );
      await cargarDatos();
    } catch (err) {
      alertaError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (servicio) => {
    if (rol !== 'ADMIN') {
      alertaError('Solo el rol ADMIN puede eliminar servicios.');
      return;
    }

    const confirmado = await confirmarEliminar();
    if (!confirmado) return;

    setCargando(true);
    try {
      const response = await fetch(
          `${API_URLS.DELETE}?servicio_id=${encodeURIComponent(servicio.servicio_id)}`,
          {
            method: 'DELETE',
            headers: getHeadersDynamo(),
          }
      );

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'No se pudo eliminar el servicio');
      }

      toast.fire({ icon: 'success', title: `Servicio ${servicio.servicio_id} eliminado` });
      await cargarDatos();
    } catch (err) {
      alertaError(err.message);
      setCargando(false);
    }
  };

  const columnas = [
    { label: 'ID Servicio' },
    { label: 'Nombre' },
    { label: 'Categoría' },
    ...(rol === 'ADMIN' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
  ];

  return (
      <div className="pantalla-principal-container">
        <PageHeader
            icon="cloud"
            title="Gestión de Servicios (DynamoDB)"
            subtitle={`${servicios.length} ${servicios.length === 1 ? 'servicio registrado' : 'servicios registrados'}`}
        >
          {rol === 'ADMIN' && (
              <AddButton onClick={handleAbrirCrear}>Nuevo Servicio</AddButton>
          )}
        </PageHeader>

        {cargando ? (
            <div className="cargando-texto">
              <span className="spinner" /> Cargando datos desde AWS DynamoDB...
            </div>
        ) : (
            <DataTable
                columns={columnas}
                data={servicios}
                emptyMessage="No se encontraron servicios"
                renderRow={(s) => (
                    <tr key={s.servicio_id} className="fila-servicio">
                      <td><span className="texto-id">{s.servicio_id}</span></td>
                      <td className="texto-nombre">{s.nombre}</td>
                      <td><span className="chip-categoria">{s.categoria_id}</span></td>
                      {rol === 'ADMIN' && (
                          <td>
                            <div className="acciones-tabla">
                              <EditButton onClick={() => handleAbrirEditar(s)} />
                              <DeleteButton onClick={() => handleEliminar(s)} />
                            </div>
                          </td>
                      )}
                    </tr>
                )}
            />
        )}

        {modalFormOpen && (
            <div className="modal-overlay" onClick={() => setModalFormOpen(false)}>
              <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                <h3>
                            <span className="material-symbols-outlined">
                                {servicioSeleccionado ? 'edit_square' : 'add_circle'}
                            </span>
                  {servicioSeleccionado ? 'Editar servicio' : 'Nuevo servicio'}
                </h3>
                <form onSubmit={handleGuardar} className="modal-form">
                  <Input
                      label="ID Servicio"
                      value={formData.servicio_id}
                      onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
                      disabled={!!servicioSeleccionado}
                      maxLength={25}
                      required
                  />

                  <Input
                      label="Nombre del Servicio"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      maxLength={100}
                      required
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <label className="label">Categoría (desde BD)</label>
                    <select
                        value={formData.categoria_id}
                        onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                        className="modal-input"
                        required
                    >
                      <option value="">Seleccionar categoría...</option>
                      {categorias.map((cat) => (
                          <option key={cat.categoria_id} value={cat.categoria_id}>
                            {cat.categoria_id} - {cat.nombre}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-acciones">
                    <button type="button" className="btn-cancelar" onClick={() => setModalFormOpen(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primario">
                      {servicioSeleccionado ? 'Guardar cambios' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}