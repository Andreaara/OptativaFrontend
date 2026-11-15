import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

export default function Pagos() {
    const [pagos, setPagos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);
    const [antiguedad, setAntiguedad] = useState(null);

    const [formData, setFormData] = useState({
        pago_id: null,
        factura_id: '',
        monto: '',
        tipo_tarjeta: '',
        fecha_pago: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarPagos = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/pagos');
            setPagos(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPagos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            pago_id: null,
            factura_id: '',
            monto: '',
            tipo_tarjeta: '',
            fecha_pago: '',
        });
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (pago) => {
        setFormData(pago);
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setErrorApi(null);

        try {
            if (editando) {
                setPagos((prev) =>
                    prev.map((item) =>
                        item.pago_id === formData.pago_id ? { ...formData } : item
                    )
                );
            } else {
                await apiFetch('/pagos', {
                    method: 'POST',
                    body: JSON.stringify({
                        factura_id: Number(formData.factura_id),
                        monto: parseFloat(formData.monto),
                        tipo_tarjeta: formData.tipo_tarjeta,
                    }),
                });
                await cargarPagos();
            }
            resetForm();
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = (pago_id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
            setPagos((prev) => prev.filter((item) => item.pago_id !== pago_id));
            if (formData.pago_id === pago_id) {
                resetForm();
            }
        }
    };

    const handleVerAntiguedad = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/reportes?tipo=antiguedad');
            setAntiguedad(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pantalla-principal-container">
            {/* HEADER */}
            <div className="pantalla-header">
                <div className="pantalla-titulo">
                    <span className="titulo-icono">
                        <span className="material-symbols-outlined">payments</span>
                    </span>
                    <div>
                        <h2>Gestión de Pagos</h2>
                        <p>
                            {pagos.length}{' '}
                            {pagos.length === 1 ? 'pago registrado' : 'pagos registrados'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button type="button" className="btn-cancelar" onClick={handleVerAntiguedad}>
                        Antigüedad Saldos (SP)
                    </button>
                    <AddButton onClick={handleAbrirCrear}>Registrar Pago</AddButton>
                </div>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

            {antiguedad && (
                <div className="modal-contenido" style={{ marginBottom: '16px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong>Reporte de Antigüedad de Saldos (Facturas Pendientes)</strong>
                        <button type="button" className="btn-cancelar" onClick={() => setAntiguedad(null)}>
                            Cerrar
                        </button>
                    </div>
                    {antiguedad.length === 0 ? (
                        <p>No hay facturas pendientes de pago.</p>
                    ) : (
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {antiguedad.map((f, idx) => (
                                <li key={idx}>
                                    Folio <strong>{f.folio}</strong> | Saldo pendiente:{' '}
                                    <strong>${parseFloat(f.saldo_pendiente || f.total || 0).toFixed(2)}</strong> | Días vencidos:{' '}
                                    <strong>{f.dias_antiguedad ?? 0}</strong> ({f.rango_antiguedad || 'Al corriente'})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando pagos con AWS...
                </div>
            )}

            {/* TABLA DE PAGOS */}
            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>ID Pago</th>
                            <th>ID Factura</th>
                            <th>Monto</th>
                            <th>Tipo de Tarjeta</th>
                            <th>Fecha de Pago</th>
                            <th className="col-acciones">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pagos.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay pagos registrados</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            pagos.map((item) => (
                                <tr key={item.pago_id} className="fila-servicio">
                                    <td>
                                        <span className="texto-id">{item.pago_id}</span>
                                    </td>
                                    <td>
                                        <span className="texto-id">{item.factura_id}</span>
                                    </td>
                                    <td>
                                        <strong>${parseFloat(item.monto || 0).toFixed(2)}</strong>
                                    </td>
                                    <td>
                                        <span className="chip-categoria">{item.tipo_tarjeta}</span>
                                    </td>
                                    <td>
                                        {item.fecha_pago
                                            ? new Date(item.fecha_pago).toLocaleString()
                                            : 'Recién registrado'}
                                    </td>
                                    <td>
                                        <div className="acciones-tabla">
                                            <EditButton onClick={() => handleEdit(item)} />
                                            <DeleteButton onClick={() => handleDelete(item.pago_id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL REGISTRAR / EDITAR PAGO */}
            {modalOpen && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <span className="material-symbols-outlined">
                                {editando ? 'edit_square' : 'add_card'}
                            </span>
                            {editando ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="ID Factura (FK)"
                                    type="number"
                                    name="factura_id"
                                    value={formData.factura_id}
                                    onChange={handleChange}
                                    placeholder="Ej. 1"
                                    required
                                />
                                <Input
                                    label="Monto ($)"
                                    type="number"
                                    step="0.01"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <label className="label">Tipo de Tarjeta</label>
                                <select
                                    name="tipo_tarjeta"
                                    value={formData.tipo_tarjeta}
                                    onChange={handleChange}
                                    className="modal-input"
                                    required
                                >
                                    <option value="">Seleccionar tipo...</option>
                                    <option value="Crédito">Crédito</option>
                                    <option value="Débito">Débito</option>
                                    <option value="Prepago">Prepago</option>
                                    <option value="Corporativa">Corporativa</option>
                                </select>
                            </div>

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editando ? 'Guardar Cambios' : 'Registrar Pago'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}