import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

export default function FacturaEncabezado() {
    const [facturas, setFacturas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);
    const [cierreFiscal, setCierreFiscal] = useState(null);

    const [formData, setFormData] = useState({
        factura_id: null,
        emisor_id: '',
        cliente_id: '',
        folio: '',
        fecha_emision: '',
        subtotal: '',
        impuestos: '',
        total: '',
        estatus: 'PENDIENTE',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
    const [facturaAEliminar, setFacturaAEliminar] = useState(null);

    const cargarFacturas = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/facturas');
            setFacturas(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarFacturas();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedForm = { ...formData, [name]: value };

        if (name === 'subtotal' || name === 'impuestos') {
            const sub = parseFloat(updatedForm.subtotal) || 0;
            const imp = parseFloat(updatedForm.impuestos) || 0;
            updatedForm.total = (sub + imp).toFixed(2);
        }

        setFormData(updatedForm);
    };

    const resetForm = () => {
        setFormData({
            factura_id: null,
            emisor_id: '',
            cliente_id: '',
            folio: '',
            fecha_emision: '',
            subtotal: '',
            impuestos: '',
            total: '',
            estatus: 'PENDIENTE',
        });
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormData({
            ...item,
            fecha_emision: item.fecha_emision ? item.fecha_emision.split('T')[0] : '',
        });
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setErrorApi(null);

        try {
            if (editando) {
                setFacturas((prev) =>
                    prev.map((item) =>
                        item.factura_id === formData.factura_id ? { ...formData } : item
                    )
                );
            } else {
                const res = await apiFetch('/facturas', {
                    method: 'POST',
                    body: JSON.stringify({
                        emisor_id: Number(formData.emisor_id),
                        cliente_id: Number(formData.cliente_id),
                    }),
                });
                alert(`Factura generada con folio atómico: ${res.folio}`);
                await cargarFacturas();
            }
            resetForm();
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleAbrirEliminar = (item) => {
        setFacturaAEliminar(item);
        setModalEliminarOpen(true);
    };

    // Ejecuta sp_cancelar_factura en RDS (reversión contable)
    const handleConfirmarEliminar = async () => {
        if (!facturaAEliminar) return;

        setCargando(true);
        setErrorApi(null);
        try {
            await apiFetch('/facturas', {
                method: 'PUT',
                body: JSON.stringify({
                    accion: 'CANCELAR',
                    factura_id: facturaAEliminar.factura_id,
                }),
            });
            await cargarFacturas();
            if (formData.factura_id === facturaAEliminar.factura_id) {
                resetForm();
            }
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
            setModalEliminarOpen(false);
            setFacturaAEliminar(null);
        }
    };

    // Ejecuta sp_cierre_fiscal del mes actual
    const handleCierreFiscal = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const periodoActual = new Date().toISOString().slice(0, 7); // YYYY-MM
            const data = await apiFetch(`/reportes?tipo=cierre&periodo=${periodoActual}`);
            setCierreFiscal(Array.isArray(data) && data.length > 0 ? data[0] : null);
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pantalla-principal-container">
            {/* HEADER DE LA PANTALLA */}
            <div className="pantalla-header">
                <div className="pantalla-titulo">
                    <span className="titulo-icono">
                        <span className="material-symbols-outlined">receipt_long</span>
                    </span>
                    <div>
                        <h2>Encabezado de Facturas</h2>
                        <p>
                            {facturas.length}{' '}
                            {facturas.length === 1 ? 'factura registrada' : 'facturas registradas'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button type="button" className="btn-cancelar" onClick={handleCierreFiscal}>
                        Cierre Fiscal (SP)
                    </button>
                    <AddButton onClick={handleAbrirCrear}>Nueva Factura</AddButton>
                </div>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

            {cierreFiscal && (
                <div className="modal-contenido" style={{ marginBottom: '16px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Consolidado Cierre Fiscal ({cierreFiscal.periodo_fiscal})</strong>
                        <button type="button" className="btn-cancelar" onClick={() => setCierreFiscal(null)}>
                            Cerrar
                        </button>
                    </div>
                    <p style={{ marginTop: '8px' }}>
                        Facturas activas: <strong>{cierreFiscal.total_facturas_emitidas}</strong> | Subtotal:{' '}
                        <strong>${parseFloat(cierreFiscal.total_subtotal || 0).toFixed(2)}</strong> | IVA:{' '}
                        <strong>${parseFloat(cierreFiscal.total_iva_trasladado || 0).toFixed(2)}</strong> | Total Neto:{' '}
                        <strong>${parseFloat(cierreFiscal.gran_total_neto || 0).toFixed(2)}</strong>
                    </p>
                </div>
            )}

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando facturas con AWS...
                </div>
            )}

            {/* TABLA DE FACTURAS */}
            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Folio</th>
                            <th>Emisor ID</th>
                            <th>Cliente ID</th>
                            <th>Estatus</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th className="col-acciones">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {facturas.length === 0 ? (
                            <tr>
                                <td colSpan="8">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay facturas registradas</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            facturas.map((item) => (
                                <tr key={item.factura_id} className="fila-servicio">
                                    <td>
                                        <span className="texto-id">{item.factura_id}</span>
                                    </td>
                                    <td className="texto-nombre">{item.folio}</td>
                                    <td>
                                        <span className="texto-id">{item.emisor_id}</span>
                                    </td>
                                    <td>
                                        <span className="texto-id">{item.cliente_id}</span>
                                    </td>
                                    <td>
                                        <span className="chip-categoria">{item.estatus || 'PENDIENTE'}</span>
                                    </td>
                                    <td>${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                                    <td>
                                        <strong>${parseFloat(item.total || 0).toFixed(2)}</strong>
                                    </td>
                                    <td>
                                        <div className="acciones-tabla">
                                            <EditButton onClick={() => handleEdit(item)} />
                                            <DeleteButton onClick={() => handleAbrirEliminar(item)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL PARA CREAR / EDITAR FACTURA */}
            {modalOpen && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <span className="material-symbols-outlined">
                                {editando ? 'edit_square' : 'post_add'}
                            </span>
                            {editando ? 'Detalle de Factura' : 'Nueva Factura (Folio Automático SP)'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Emisor ID (FK)"
                                    type="number"
                                    name="emisor_id"
                                    value={formData.emisor_id}
                                    onChange={handleChange}
                                    disabled={editando}
                                    required
                                />
                                <Input
                                    label="Cliente ID (FK)"
                                    type="number"
                                    name="cliente_id"
                                    value={formData.cliente_id}
                                    onChange={handleChange}
                                    disabled={editando}
                                    required
                                />
                            </div>

                            {editando && (
                                <>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Input
                                            label="Folio"
                                            type="text"
                                            name="folio"
                                            value={formData.folio}
                                            readOnly
                                            disabled
                                        />
                                        <Input
                                            label="Fecha Emisión"
                                            type="date"
                                            name="fecha_emision"
                                            value={formData.fecha_emision}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Input
                                            label="Subtotal ($)"
                                            type="number"
                                            step="0.01"
                                            name="subtotal"
                                            value={formData.subtotal}
                                            readOnly
                                            disabled
                                        />
                                        <Input
                                            label="Impuestos ($)"
                                            type="number"
                                            step="0.01"
                                            name="impuestos"
                                            value={formData.impuestos}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <Input
                                        label="Total ($)"
                                        type="number"
                                        step="0.01"
                                        name="total"
                                        value={formData.total}
                                        readOnly
                                        disabled
                                    />
                                </>
                            )}

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                {!editando && (
                                    <button type="submit" className="btn-primario">
                                        Generar Factura
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PARA CANCELAR FACTURA (SP 4) */}
            {modalEliminarOpen && facturaAEliminar && (
                <div className="modal-overlay" onClick={() => setModalEliminarOpen(false)}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3 className="titulo-eliminar">
                            <span className="material-symbols-outlined">warning</span>
                            Cancelar Factura (SP Contable)
                        </h3>

                        <p className="texto-confirmacion">
                            ¿Seguro que deseas cancelar fiscalmente la factura{' '}
                            <strong>{facturaAEliminar.folio}</strong>? Sus importes pasarán a $0.00 y el estatus cambiará a CANCELADA.
                        </p>

                        <div className="modal-acciones">
                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => setModalEliminarOpen(false)}
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                className="btn-peligro"
                                onClick={handleConfirmarEliminar}
                            >
                                Cancelar Factura
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}