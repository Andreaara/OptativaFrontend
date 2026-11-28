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

const normalizarClaveAtributo = (texto) =>
    limpiarTexto(texto)
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_áéíóúñ]/g, '');

const parsearValorAtributo = (valor) => {
  const limpio = limpiarTexto(String(valor));
  if (/^-?\d+(\.\d+)?$/.test(limpio)) {
    return Number(limpio);
  }
  return limpio;
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

  // Lista editable de características [{ id, clave, valor }]
  const [caracteristicasLista, setCaracteristicasLista] = useState([]);
  const [nuevaClave, setNuevaClave] = useState('');
  const [nuevoValor, setNuevoValor] = useState('');
  const [filtroCaract, setFiltroCaract] = useState('');

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

  const limpiarEstadoModal = () => {
    setModalFormOpen(false);
    setServicioSeleccionado(null);
    setCaracteristicasLista([]);
    setNuevaClave('');
    setNuevoValor('');
    setFiltroCaract('');
  };

  const handleAbrirCrear = () => {
    setServicioSeleccionado(null);
    setFormData({
      servicio_id: `SERV-${Math.floor(101 + Math.random() * 899)}`,
      nombre: '',
      categoria_id: categorias.length > 0 ? categorias[0].categoria_id : '',
    });
    setCaracteristicasLista([]);
    setNuevaClave('');
    setNuevoValor('');
    setFiltroCaract('');
    setModalFormOpen(true);
  };

  const handleAbrirEditar = (servicio) => {
    setServicioSeleccionado(servicio);
    setFormData({
      servicio_id: servicio.servicio_id,
      nombre: servicio.nombre || '',
      categoria_id: servicio.categoria_id || (categorias[0]?.categoria_id ?? ''),
    });

    const objetoCaract =
        servicio.caracteristicas && typeof servicio.caracteristicas === 'object'
            ? servicio.caracteristicas
            : {};

    const listaConvertida = Object.entries(objetoCaract).map(([clave, valor], idx) => ({
      id: `${clave}-${idx}-${Date.now()}`,
      clave,
      valor: valor !== null && valor !== undefined ? String(valor) : '',
    }));

    setCaracteristicasLista(listaConvertida);
    setNuevaClave('');
    setNuevoValor('');
    setFiltroCaract('');
    setModalFormOpen(true);
  };

  const handleAgregarCaracteristica = () => {
    const claveNormalizada = normalizarClaveAtributo(nuevaClave);
    const valorLimpio = limpiarTexto(nuevoValor);

    if (!claveNormalizada || !valorLimpio) {
      alertaCamposVacios();
      return;
    }

    if (claveNormalizada.length < 2 || claveNormalizada.length > 60) {
      alertaCamposCaracteres('El nombre de la característica debe tener entre 2 y 60 caracteres.');
      return;
    }

    const existe = caracteristicasLista.some(
        (item) => normalizarClaveAtributo(item.clave) === claveNormalizada
    );
    if (existe) {
      alertaError(`La característica "${claveNormalizada}" ya existe en este servicio.`);
      return;
    }

    setCaracteristicasLista((prev) => [
      {
        id: `new-${Date.now()}-${Math.random()}`,
        clave: claveNormalizada,
        valor: valorLimpio,
      },
      ...prev,
    ]);
    setNuevaClave('');
    setNuevoValor('');
  };

  const handleEditarItemCaracteristica = (id, campo, nuevoTexto) => {
    setCaracteristicasLista((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [campo]: nuevoTexto } : item))
    );
  };

  const handleEliminarCaracteristica = (id) => {
    setCaracteristicasLista((prev) => prev.filter((item) => item.id !== id));
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

    // Construir y validar el diccionario de características
    const caracteristicasObj = {};
    for (const item of caracteristicasLista) {
      const claveLimpia = normalizarClaveAtributo(item.clave);
      const valorLimpio = limpiarTexto(item.valor);

      if (!claveLimpia || !valorLimpio) {
        alertaError('Ninguna característica puede quedar con nombre o valor vacío.');
        return;
      }
      if (Object.prototype.hasOwnProperty.call(caracteristicasObj, claveLimpia)) {
        alertaError(`Tienes una característica duplicada: "${claveLimpia}".`);
        return;
      }
      caracteristicasObj[claveLimpia] = parsearValorAtributo(valorLimpio);
    }

    setCargando(true);
    const esEdicion = !!servicioSeleccionado;
    const url = esEdicion ? API_URLS.PUT : API_URLS.POST;
    const metodo = esEdicion ? 'PUT' : 'POST';

    const payload = {
      ...(esEdicion ? servicioSeleccionado : {}),
      servicio_id: idLimpio,
      nombre: nombreValido,
      categoria_id: formData.categoria_id,
      caracteristicas: caracteristicasObj,
    };

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: getHeadersDynamo(),
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Error al procesar la solicitud');
      }

      limpiarEstadoModal();
      await alertaExito(
          esEdicion
              ? `Servicio actualizado con ${Object.keys(caracteristicasObj).length} características.`
              : `Servicio registrado con ${Object.keys(caracteristicasObj).length} características.`
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

  const caracteristicasFiltradas = caracteristicasLista.filter((item) => {
    const q = filtroCaract.toLowerCase().trim();
    if (!q) return true;
    return (
        item.clave.toLowerCase().includes(q) ||
        String(item.valor).toLowerCase().includes(q)
    );
  });

  const columnas = [
    { label: 'ID Servicio' },
    { label: 'Nombre' },
    { label: 'Categoría' },
    { label: 'Características' },
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
                renderRow={(s) => {
                  const totalCaract =
                      s.caracteristicas && typeof s.caracteristicas === 'object'
                          ? Object.keys(s.caracteristicas).length
                          : 0;

                  return (
                      <tr key={s.servicio_id} className="fila-servicio">
                        <td><span className="texto-id">{s.servicio_id}</span></td>
                        <td className="texto-nombre">{s.nombre}</td>
                        <td><span className="chip-categoria">{s.categoria_id}</span></td>
                        <td>
                  <span className="chip-categoria">
                    {totalCaract} {totalCaract === 1 ? 'atributo' : 'atributos'}
                  </span>
                        </td>
                        {rol === 'ADMIN' && (
                            <td>
                              <div className="acciones-tabla">
                                <EditButton onClick={() => handleAbrirEditar(s)} />
                                <DeleteButton onClick={() => handleEliminar(s)} />
                              </div>
                            </td>
                        )}
                      </tr>
                  );
                }}
            />
        )}

        {modalFormOpen && (
            <div className="modal-overlay" onClick={limpiarEstadoModal}>
              <div
                  className="modal-contenido"
                  style={{ maxWidth: '760px', width: '95%' }}
                  onClick={(e) => e.stopPropagation()}
              >
                <h3>
              <span className="material-symbols-outlined">
                {servicioSeleccionado ? 'edit_square' : 'add_circle'}
              </span>
                  {servicioSeleccionado ? 'Editar servicio' : 'Nuevo servicio'}
                </h3>

                <form onSubmit={handleGuardar} className="modal-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
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
                  </div>

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

                  {/* SECCIÓN DE CARACTERÍSTICAS DINÁMICAS (NoSQL) */}
                  <div
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '14px',
                        backgroundColor: '#faf8ff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                  >
                    <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                    >
                  <span style={{ fontWeight: 700, color: '#4c1d95', fontSize: '14px' }}>
                    Características dinámicas ({caracteristicasLista.length})
                  </span>

                      {caracteristicasLista.length > 5 && (
                          <input
                              type="text"
                              value={filtroCaract}
                              onChange={(e) => setFiltroCaract(e.target.value)}
                              placeholder="Filtrar atributo o valor..."
                              className="modal-input"
                              style={{ maxWidth: '240px', padding: '6px 10px', fontSize: '13px' }}
                          />
                      )}
                    </div>

                    {/* Barra para agregar nueva característica */}
                    <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                    >
                      <input
                          type="text"
                          value={nuevaClave}
                          onChange={(e) => setNuevaClave(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAgregarCaracteristica();
                            }
                          }}
                          placeholder="Nueva característica (ej. soporte_24_7)"
                          className="modal-input"
                          style={{ fontSize: '13px' }}
                          maxLength={60}
                      />
                      <input
                          type="text"
                          value={nuevoValor}
                          onChange={(e) => setNuevoValor(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAgregarCaracteristica();
                            }
                          }}
                          placeholder="Valor (ej. Sí, 99.9%, 24 hrs)"
                          className="modal-input"
                          style={{ fontSize: '13px' }}
                          maxLength={150}
                      />
                      <button
                          type="button"
                          className="btn-primario"
                          onClick={handleAgregarCaracteristica}
                          style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}
                      >
                        + Agregar
                      </button>
                    </div>

                    {/* Listado con scroll de todas las características */}
                    <div
                        style={{
                          maxHeight: '280px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          paddingRight: '4px',
                        }}
                    >
                      {caracteristicasFiltradas.length === 0 ? (
                          <p
                              style={{
                                textAlign: 'center',
                                color: '#6b7280',
                                fontSize: '13px',
                                margin: '12px 0',
                              }}
                          >
                            {caracteristicasLista.length === 0
                                ? 'Aún no hay características. Agrega las que necesites arriba.'
                                : 'Ninguna característica coincide con tu filtro.'}
                          </p>
                      ) : (
                          caracteristicasFiltradas.map((item) => (
                              <div
                                  key={item.id}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr auto',
                                    gap: '8px',
                                    alignItems: 'center',
                                  }}
                              >
                                <input
                                    type="text"
                                    value={item.clave}
                                    onChange={(e) =>
                                        handleEditarItemCaracteristica(item.id, 'clave', e.target.value)
                                    }
                                    className="modal-input"
                                    style={{
                                      fontSize: '12px',
                                      padding: '6px 10px',
                                      backgroundColor: '#ffffff',
                                      fontWeight: 600,
                                    }}
                                    maxLength={60}
                                    required
                                />
                                <input
                                    type="text"
                                    value={item.valor}
                                    onChange={(e) =>
                                        handleEditarItemCaracteristica(item.id, 'valor', e.target.value)
                                    }
                                    className="modal-input"
                                    style={{
                                      fontSize: '12px',
                                      padding: '6px 10px',
                                      backgroundColor: '#ffffff',
                                    }}
                                    maxLength={150}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => handleEliminarCaracteristica(item.id)}
                                    title="Quitar característica"
                                    style={{
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '6px 8px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            delete
                          </span>
                                </button>
                              </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="modal-acciones">
                    <button type="button" className="btn-cancelar" onClick={limpiarEstadoModal}>
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