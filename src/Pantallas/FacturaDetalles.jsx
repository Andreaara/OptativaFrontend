import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import {
    limpiarTexto,
    validarEnteroPositivo,
    validarMontoPositivo,
} from '../Utils/validaciones.js';
import {
    alertaExito,
    alertaError,
    alertaCamposCaracteres,
    confirmarEliminar,
    toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

export default function FacturaDetalles() {
    const [detalles, setDetalles] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cfdiJson, setCfdiJson] = useState(null);
    const rol = obtenerRolActual();

    const [formData, setFormData] = useState({
        detalle_id: null,
        factura_id: '',
        servicio_id: '',
        cantidad: '',
        precio_unitario: '',
        subtotal: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarDetalles = async () => {
        setCargando(true);
        try {
            const data = await apiFetch('/detalles');
            setDetalles(Array.isArray(data) ? data : []);
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDetalles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedForm = { ...formData, [name]: value };

        if (name === 'cantidad' || name === 'precio_unitario') {
            const cant = parseFloat(updatedForm.cantidad) || 0;
            const precio = parseFloat(updatedForm.precio_unitario) || 0;
            updatedForm.subtotal = (cant * precio).toFixed(2);
        }

        setFormData(updatedForm);
    };

    const resetForm = () => {
        setFormData({
            detalle_id: null,
            factura_id: '',
            servicio_id: '',
            cantidad: '',
            precio_unitario: '',
            subtotal: '',
        });
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const facturaIdValido = validarEnteroPositivo(formData.factura_id, 'Factura ID');
        if (!facturaIdValido) return;

        const servicioLimpio = limpiarTexto(formData.servicio_id).toUpperCase();
        if (!servicioLimpio || !/^[A-Z0-9-]{2,20}$/.test(servicioLimpio)) {
            alertaCamposCaracteres('El ID del Servicio debe tener formato válido (ej. SERV-001).');
            return;
        }

        const cantidadValida = validarEnteroPositivo(formData.cantidad, 'Cantidad');
        if (!cantidadValida) return;

        const precioValido = validarMontoPositivo(formData.precio_unitario, 'Precio Unitario');
        if (!precioValido) return;

        setCargando(true);
        try {
            if (editando) {
                setDetalles((prev) =>
                    prev.map((item) =>
                        item.detalle_id === formData.detalle_id
                            ? {
                                ...item,
                                factura_id: facturaIdValido,
                                servicio_id: servicioLimpio,
                                cantidad: cantidadValida,
                                precio_unitario: precioValido,
                                subtotal: (cantidadValida * precioValido).toFixed(2),
                            }
                            : item
                    )
                );
                resetForm();
                toast.fire({ icon: 'success', title: 'Detalle actualizado en vista' });
            } else {
                await apiFetch('/detalles', {
                    method: 'POST',
                    body: JSON.stringify({
                        factura_id: facturaIdValido,
                        servicio_id: servicioLimpio,
                        cantidad: cantidadValida,
                        precio_unitario: precioValido,
                    }),
                });
                resetForm();
                await alertaExito('Detalle agregado y totales recalculados con Stored Procedures.');
                await cargarDetalles();
            }
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleEliminar = async (item) => {
        const confirmado = await confirmarEliminar();
        if (!confirmado) return;

        setDetalles((prev) => prev.filter((d) => d.detalle_id !== item.detalle_id));
        if (formData.detalle_id === item.detalle_id) {
            resetForm();
        }
        toast.fire({ icon: 'success', title: 'Detalle eliminado' });
    };

    const handleVerCfdi = async (facturaId) => {
        setCargando(true);
        try {
            const data = await apiFetch(`/reportes?tipo=cfdi&factura_id=${facturaId}`);
            setCfdiJson(data);
            toast.fire({ icon: 'success', title: `CFDI JSON generado para factura #${facturaId}` });
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const columnas = [
        { label: 'ID' },
        { label: 'Factura ID' },
        { label: 'Servicio ID' },
        { label: 'Cantidad' },
        { label: 'P. Unitario' },
        { label: 'Subtotal' },
        { label: 'Acciones', className: 'col-acciones' },
    ];

    return (
        <div className="pantalla-principal-container">
            <PageHeader
                icon="description"
                title="Detalles de Facturas"
                subtitle={`${detalles.length} ${detalles.length === 1 ? 'detalle registrado' : 'detalles registrados'}`}
            >
                {rol !== 'AUDITOR' && (
                    <AddButton onClick={handleAbrirCrear}>Agregar Detalle</AddButton>
                )}
            </PageHeader>

            {cfdiJson && (
                <div className="modal-contenido" style={{ marginBottom: '16px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong>Comprobante CFDI JSON (Stored Procedure)</strong>
                        <button type="button" className="btn-cancelar" onClick={() => setCfdiJson(null)}>
                            Cerrar JSON
                        </button>
                    </div>
                    <pre style={{ background: '#1e1b4b', color: '#e0e7ff', padding: '12px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px' }}>
                        {JSON.stringify(cfdiJson, null, 2)}
                    </pre>
                </div>
            )}

            {cargando ? (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando detalles con AWS...
                </div>
            ) : (
                <DataTable
                    columns={columnas}
                    data={detalles}
                    emptyMessage="No hay detalles registrados"
                    renderRow={(item) => (
                        <tr key={item.detalle_id} className="fila-servicio">
                            <td><span className="texto-id">{item.detalle_id}</span></td>
                            <td><span className="texto-id">{item.factura_id}</span></td>
                            <td><span className="texto-id">{item.servicio_id}</span></td>
                            <td>{item.cantidad}</td>
                            <td>${parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                            <td><strong>${parseFloat(item.subtotal || 0).toFixed(2)}</strong></td>
                            <td>
                                <div className="acciones-tabla">
                                    <button
                                        type="button"
                                        className="btn-icono btn-icono--neutro"
                                        title="Ver CFDI JSON"
                                        onClick={() => handleVerCfdi(item.factura_id)}
                                    >
                                        <span className="material-symbols-outlined">data_object</span>
                                    </button>
                                    {rol !== 'AUDITOR' && (
                                        <>
                                            <EditButton onClick={() => handleEdit(item)} />
                                            <DeleteButton onClick={() => handleEliminar(item)} />
                                        </>
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
                                {editando ? 'edit_square' : 'add_circle'}
                            </span>
                            {editando ? 'Editar Detalle' : 'Agregar Detalle'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Factura ID (FK)"
                                    type="number"
                                    min="1"
                                    name="factura_id"
                                    value={formData.factura_id}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="ID del Servicio"
                                    type="text"
                                    name="servicio_id"
                                    value={formData.servicio_id}
                                    onChange={handleChange}
                                    placeholder="Ej. SERV-001"
                                    maxLength={20}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Cantidad"
                                    type="number"
                                    min="1"
                                    name="cantidad"
                                    value={formData.cantidad}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Precio Unitario ($)"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    name="precio_unitario"
                                    value={formData.precio_unitario}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Input
                                label="Subtotal Estimado ($)"
                                type="number"
                                step="0.01"
                                name="subtotal"
                                value={formData.subtotal}
                                readOnly
                                disabled
                            />

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editando ? 'Guardar Cambios' : 'Agregar Detalle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}