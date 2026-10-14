import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input';
import '../Estilos/Estilos.css';


const CLAVE_API = 'JacksonGuapo123';

const API_URLS = {
  POST: 'https://y4kx0y3xqi.execute-api.us-east-1.amazonaws.com',
  PUT: 'https://h35bqwysm2.execute-api.us-east-1.amazonaws.com',
  GET: 'https://fjnpuuui26.execute-api.us-east-1.amazonaws.com',
  DELETE: 'https://wmf7zl0p80.execute-api.us-east-1.amazonaws.com',
};

const Icono = ({ nombre }) => (
  <span className="material-symbols-outlined" aria-hidden="true">{nombre}</span>
);

const BotonIcono = ({ icono, titulo, variante = '', onClick, type = 'button' }) => (
  <button
    type={type}
    className={`btn-icono ${variante}`}
    onClick={onClick}
    title={titulo}
    aria-label={titulo}
  >
    <Icono nombre={icono} />
  </button>
);

export default function PantallaServiciosAWS() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorApi, setErrorApi] = useState(null);

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [formData, setFormData] = useState({
    servicio_id: '',
    nombre: '',
    categoria_id: '',
  });


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

  const handleAbrirCrear = () => {
    setServicioSeleccionado(null);
    setFormData({ servicio_id: Date.now().toString(), nombre: '', categoria_id: '' });
    setModalFormOpen(true);
  };

  const handleAbrirEditar = (servicio) => {
    setServicioSeleccionado(servicio);
    setFormData({
      servicio_id: servicio.servicio_id,
      nombre: servicio.nombre,
      categoria_id: servicio.categoria_id,
    });
    setModalFormOpen(true);
  };

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
        headers: {
          'Content-Type': 'application/json',
          'x-validador': CLAVE_API
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Error al procesar la solicitud');
      }

      setModalFormOpen(false);
      cargarServicios();
    } catch (err) {
      setErrorApi(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirEliminar = (servicio) => {
    setServicioAEliminar(servicio);
    setModalEliminarOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!servicioAEliminar) return;

    setModalEliminarOpen(false);
    setCargando(true);
    setErrorApi(null);

    try {
      const response = await fetch(
          `${API_URLS.DELETE}?servicio_id=${servicioAEliminar.servicio_id}`,
          {
            method: 'DELETE',
            headers: {
              'x-validador': CLAVE_API
            }
          }
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'No se pudo eliminar el servicio');
      }

      setServicioAEliminar(null);
      cargarServicios();
    } catch (err) {
      setErrorApi(err.message);
      setCargando(false);
    }
  };

  const serviciosFiltrados = servicios;

  return (
    <div className="pantalla-principal-container">

      <div className="pantalla-header">
        <div className="pantalla-titulo">
          <span className="titulo-icono"><Icono nombre="cloud" /></span>
          <div>
            <h2>Gestión de Servicios</h2>
            <p>{servicios.length} {servicios.length === 1 ? 'servicio registrado' : 'servicios registrados'}</p>
          </div>
        </div>
        <BotonIcono
          icono="add"
          titulo="Nuevo servicio"
          variante="btn-icono--primario btn-icono--grande"
          onClick={handleAbrirCrear}
        />
      </div>

      {errorApi && (
        <div className="alerta-error" role="alert">
          <Icono nombre="error" /> {errorApi}
        </div>
      )}

      {cargando && (
        <div className="cargando-texto">
          <span className="spinner" /> Cargando datos desde AWS...
        </div>
      )}

      {!cargando && (
        <div className="tabla-contenedor">
          <table className="tabla-servicios">
            <thead>
              <tr>
                <th>ID Servicio</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th className="col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {serviciosFiltrados.length > 0 ? (
                serviciosFiltrados.map((s) => (
                  <tr key={s.servicio_id} className="fila-servicio">
                    <td><span className="texto-id">{s.servicio_id}</span></td>
                    <td className="texto-nombre">{s.nombre}</td>
                    <td><span className="chip-categoria">{s.categoria_id}</span></td>
                    <td>
                      <div className="acciones-tabla">
                        <BotonIcono icono="edit" titulo="Editar" variante="btn-icono--editar" onClick={() => handleAbrirEditar(s)} />
                        <BotonIcono
                          icono="delete"
                          titulo="Eliminar"
                          variante="btn-icono--eliminar"
                          onClick={() => handleAbrirEliminar(s)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    <div className="tabla-vacia">
                      <Icono nombre="inbox" />
                      <span>No se encontraron servicios</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalFormOpen && (
        <div className="modal-overlay" onClick={() => setModalFormOpen(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h3>
              <Icono nombre={servicioSeleccionado ? 'edit_square' : 'add_circle'} />
              {servicioSeleccionado ? 'Editar servicio' : 'Nuevo servicio'}
            </h3>
            <form onSubmit={handleGuardar} className="modal-form">

              <Input
                label="ID Servicio"
                value={formData.servicio_id}
                onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
                disabled={!!servicioSeleccionado}
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
      {modalEliminarOpen && servicioAEliminar && (
        <div className="modal-overlay" onClick={() => setModalEliminarOpen(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h3 className="titulo-eliminar">
              <Icono nombre="warning" />
              Eliminar servicio
            </h3>

            <p className="texto-confirmacion">
              ¿Seguro que deseas eliminar el servicio{' '}
              <strong>{servicioAEliminar.nombre}</strong>{' '}
              (<span className="texto-id">{servicioAEliminar.servicio_id}</span>)?
              Esta acción no se puede deshacer.
            </p>

            <div className="modal-acciones">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setModalEliminarOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-peligro"
                onClick={handleConfirmarEliminar}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
