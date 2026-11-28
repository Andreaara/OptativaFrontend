import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import { validarTexto } from '../Utils/validaciones.js';
import {
  swalBase,
  alertaExito,
  alertaError,
  alertaCamposVacios,
  alertaSinCambios,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

export default function Impuestos() {
  const [impuestos, setImpuestos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const rol = obtenerRolActual();

  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre_impuesto: '',
    tasa_porcentaje: '',
    fecha_inicio_vigencia: new Date().toISOString().split('T')[0],
  });

  const cargarImpuestos = async () => {
    setCargando(true);
    try {
      const data = await apiFetch('/impuestos');
      setImpuestos(Array.isArray(data) ? data : []);
    } catch (err) {
      alertaError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarImpuestos();
  }, []);

  const resetForm = () => {
    setFormData({
      nombre_impuesto: '',
      tasa_porcentaje: '',
      fecha_inicio_vigencia: new Date().toISOString().split('T')[0],
    });
    setModalCrearOpen(false);
  };

  const handleCrearImpuesto = async (e) => {
    e.preventDefault();
    if (rol !== 'ADMIN') {
      alertaError('Solo el rol ADMIN puede registrar impuestos.');
      return;
    }

    const nombreValido = validarTexto(formData.nombre_impuesto, 'Nombre del Impuesto', {
      min: 3,
      max: 50,
    });
    if (!nombreValido) return;

    const tasaNum = parseFloat(formData.tasa_porcentaje);
    if (formData.tasa_porcentaje === '' || isNaN(tasaNum) || tasaNum < 0 || tasaNum > 100) {
      alertaError('La tasa porcentual debe ser un número entre 0 y 100.');
      return;
    }

    if (!formData.fecha_inicio_vigencia) {
      alertaCamposVacios();
      return;
    }

    setCargando(true);
    try {
      await apiFetch('/impuestos', {
        method: 'POST',
        body: JSON.stringify({
          nombre_impuesto: nombreValido,
          tasa_porcentaje: Number(tasaNum.toFixed(2)),
          fecha_inicio_vigencia: formData.fecha_inicio_vigencia,
        }),
      });
      resetForm();
      await alertaExito('Impuesto registrado en RDS.');
      await cargarImpuestos();
    } catch (err) {
      alertaError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarTasa = async (imp) => {
    if (rol !== 'ADMIN') {
      alertaError('Solo el rol ADMIN puede actualizar tasas fiscales.');
      return;
    }

    const { value: valorIngresado, isConfirmed } = await swalBase.fire({
      title: 'Actualizar Tasa de Impuesto',
      text: `Nueva tasa porcentual para "${imp.nombre_impuesto}" (actual: ${Number(imp.tasa_porcentaje).toFixed(2)}%)`,
      input: 'number',
      inputValue: imp.tasa_porcentaje,
      inputAttributes: { step: '0.01', min: '0', max: '100' },
      showCancelButton: true,
      confirmButtonText: 'Actualizar Impuesto',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        const num = parseFloat(value);
        if (value === '' || isNaN(num) || num < 0 || num > 100) {
          return 'Debes ingresar un porcentaje válido entre 0 y 100';
        }
        return null;
      },
    });

    if (!isConfirmed) return;

    const nuevaTasa = Number(parseFloat(valorIngresado).toFixed(2));
    if (nuevaTasa === Number(imp.tasa_porcentaje)) {
      alertaSinCambios();
      return;
    }

    setCargando(true);
    try {
      await apiFetch('/impuestos', {
        method: 'PUT',
        body: JSON.stringify({
          impuesto_id: imp.impuesto_id,
          nueva_tasa: nuevaTasa,
        }),
      });
      await alertaExito(`Tasa actualizada a ${nuevaTasa.toFixed(2)}% mediante sp_actualizar_tasa_impuesto.`);
      await cargarImpuestos();
    } catch (err) {
      alertaError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const columnas = [
    { label: 'ID' },
    { label: 'Nombre del Impuesto' },
    { label: 'Tasa (%)' },
    { label: 'Inicio Vigencia' },
    { label: 'Fin Vigencia' },
    { label: 'Estado' },
    ...(rol === 'ADMIN' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
  ];

  return (
      <div className="pantalla-principal-container">
        <PageHeader
            icon="percent"
            title="Impuestos Histórico (RDS)"
            subtitle={`${impuestos.length} ${impuestos.length === 1 ? 'tasa registrada' : 'tasas registradas'}`}
        >
          {rol === 'ADMIN' && (
              <AddButton onClick={() => setModalCrearOpen(true)}>Nuevo Impuesto</AddButton>
          )}
        </PageHeader>

        {cargando ? (
            <div className="cargando-texto">
              <span className="spinner" /> Cargando histórico de impuestos...
            </div>
        ) : (
            <DataTable
                columns={columnas}
                data={impuestos}
                emptyMessage="No hay impuestos registrados"
                renderRow={(imp) => (
                    <tr key={imp.impuesto_id} className="fila-servicio">
                      <td><span className="texto-id">{imp.impuesto_id}</span></td>
                      <td className="texto-nombre">{imp.nombre_impuesto}</td>
                      <td><strong>{Number(imp.tasa_porcentaje || 0).toFixed(2)}%</strong></td>
                      <td>{imp.fecha_inicio_vigencia ? imp.fecha_inicio_vigencia.split('T')[0] : '-'}</td>
                      <td>{imp.fecha_fin_vigencia ? imp.fecha_fin_vigencia.split('T')[0] : 'Vigente'}</td>
                      <td>
                                <span className="chip-categoria">
                                    {imp.activo ? 'Vigente' : 'Histórico'}
                                </span>
                      </td>
                      {rol === 'ADMIN' && (
                          <td>
                            <div className="acciones-tabla">
                              <button
                                  type="button"
                                  className="btn-primario"
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                  onClick={() => handleActualizarTasa(imp)}
                              >
                                Actualizar Tasa
                              </button>
                            </div>
                          </td>
                      )}
                    </tr>
                )}
            />
        )}

        {modalCrearOpen && (
            <div className="modal-overlay" onClick={resetForm}>
              <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                <h3>
                  <span className="material-symbols-outlined">add_circle</span>
                  Nuevo Impuesto
                </h3>
                <form onSubmit={handleCrearImpuesto} className="modal-form">
                  <Input
                      label="Nombre del Impuesto"
                      type="text"
                      name="nombre_impuesto"
                      value={formData.nombre_impuesto}
                      onChange={(e) => setFormData({ ...formData, nombre_impuesto: e.target.value })}
                      placeholder="Ej. IVA General"
                      maxLength={50}
                      required
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Input
                        label="Tasa (%)"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        name="tasa_porcentaje"
                        value={formData.tasa_porcentaje}
                        onChange={(e) => setFormData({ ...formData, tasa_porcentaje: e.target.value })}
                        placeholder="16.00"
                        required
                    />
                    <Input
                        label="Inicio de Vigencia"
                        type="date"
                        name="fecha_inicio_vigencia"
                        value={formData.fecha_inicio_vigencia}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio_vigencia: e.target.value })}
                        required
                    />
                  </div>
                  <div className="modal-acciones">
                    <button type="button" className="btn-cancelar" onClick={resetForm}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primario">
                      Guardar Impuesto
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}