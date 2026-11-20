import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import { validarEnteroPositivo } from '../Utils/validaciones.js';
import {
    alertaExito,
    alertaError,
    confirmarEliminar,
    toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

export default function FacturaEncabezado() {
    const [facturas, setFacturas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cierreFiscal, setCierreFiscal] = useState(null);
    const rol = obtenerRolActual();

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

    const cargarFacturas = async () => {
        setCargando(true);
        try {
            const data = await apiFetch('/facturas');
            setFacturas(Array.isArray(data) ? data : []);
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarFacturas();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const handleVerDetalle = (item) => {
        setFormData({
            ...item,
            fecha_emision: item.fecha_emision ? item.fecha_emision.split('T')[0] : '',
        });
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editando) return;

        const emisorIdValido = validarEnteroPositivo(formData.emisor_id, 'Emisor ID');
        if (!emisorIdValido) return;

        const clienteIdValido = validarEnteroPositivo(formData.cliente_id, 'Cliente ID');
        if (!clienteIdValido) return;

        setCargando(true);
        try {
            const res = await apiFetch('/facturas', {
                method: 'POST',
                body: JSON.stringify({
                    emisor_id: emisorIdValido,
                    cliente_id: clienteIdValido,
                }),
            });
            resetForm();
            await alertaExito(`Factura generada con folio atómico: ${res.folio}`);
            await cargarFacturas();
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Ejecuta sp_cancelar_factura en RDS (Solo ADMIN)
    const handleCancelarFactura = async (item) => {
        if (rol !== 'ADMIN') {
            alertaError('Solo el rol ADMIN puede cancelar facturas.');
            return;
        }
        if (item.estatus === 'CANCELADA') {
            toast.fire({ icon: 'info', title: 'Esta factura ya está cancelada' });
            return;
        }

        const confirmado = await confirmarEliminar();
        if (!confirmado) return;

        setCargando(true);
        try {
            await apiFetch('/facturas', {
                method: 'PUT',
                body: JSON.stringify({
                    accion: 'CANCELAR',
                    factura_id: item.factura_id,
                }),
            });
            toast.fire({ icon: 'success', title: `Factura ${item.folio} cancelada con SP` });
            await cargarFacturas();
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Ejecuta sp_cierre_fiscal del mes actual
    const handleCierreFiscal = async () => {
        setCargando(true);
        try {
            const periodoActual = new Date().toISOString().slice(0, 7);
            const data = await apiFetch(`/reportes?tipo=cierre&periodo=${periodoActual}`);
            setCierreFiscal(Array.isArray(data) && data.length > 0 ? data[0] : null);
            toast.fire({ icon: 'success', title: `Cierre fiscal ${periodoActual} generado` });
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const columnas = [
        { label: 'ID' },
        { label: 'Folio' },
        { label: 'Emisor ID' },
        { label: 'Cliente ID' },
        { label: 'Estatus' },
        { label: 'Subtotal' },
        { label: 'Total' },
        { label: 'Acciones', className: 'col-acciones' },
    ];

    return (
        <div className="pantalla-principal-container">
            <PageHeader
                icon="receipt_long"
                title="Encabezado de Facturas"
                subtitle={`${facturas.length} ${facturas.length === 1 ? 'factura registrada' : 'facturas registradas'}`}
            >
                <button type="button" className="btn-cancelar" onClick={handleCierreFiscal}>
                    Cierre Fiscal (SP)
                </button>
                {rol !== 'AUDITOR' && (
                    <AddButton onClick={handleAbrirCrear}>Nueva Factura</AddButton>
                )}
            </PageHeader>

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

            {cargando ? (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando facturas con AWS...
                </div>
            ) : (
                <DataTable
                    columns={columnas}
                    data={facturas}
                    emptyMessage="No hay facturas registradas"
                    renderRow={(item) => (
                        <tr key={item.factura_id} className="fila-servicio">
                            <td><span className="texto-id">{item.factura_id}</span></td>
                            <td className="texto-nombre">{item.folio}</td>
                            <td><span className="texto-id">{item.emisor_id}</span></td>
                            <td><span className="texto-id">{item.cliente_id}</span></td>
                            <td><span className="chip-categoria">{item.estatus || 'PENDIENTE'}</span></td>
                            <td>${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                            <td><strong>${parseFloat(item.total || 0).toFixed(2)}</strong></td>
                            <td>
                                <div className="acciones-tabla">
                                    <EditButton onClick={() => handleVerDetalle(item)} />
                                    {rol === 'ADMIN' && (
                                        <DeleteButton onClick={() => handleCancelarFactura(item)} />
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                />
            )}

            {modalOpen && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <span className="material-symbols-outlined">
                                {editando ? 'visibility' : 'post_add'}
                            </span>
                            {editando ? 'Resumen de Factura' : 'Nueva Factura (Folio Automático SP)'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Emisor ID (FK)"
                                    type="number"
                                    min="1"
                                    name="emisor_id"
                                    value={formData.emisor_id}
                                    onChange={handleChange}
                                    disabled={editando}
                                    required
                                />
                                <Input
                                    label="Cliente ID (FK)"
                                    type="number"
                                    min="1"
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
                                        <Input label="Folio" type="text" name="folio" value={formData.folio} readOnly disabled />
                                        <Input label="Fecha Emisión" type="date" name="fecha_emision" value={formData.fecha_emision} readOnly disabled />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Input label="Subtotal ($)" type="number" name="subtotal" value={formData.subtotal} readOnly disabled />
                                        <Input label="Impuestos ($)" type="number" name="impuestos" value={formData.impuestos} readOnly disabled />
                                    </div>
                                    <Input label="Total ($)" type="number" name="total" value={formData.total} readOnly disabled />
                                </>
                            )}

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    {editando ? 'Cerrar' : 'Cancelar'}
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
        </div>
    );
}