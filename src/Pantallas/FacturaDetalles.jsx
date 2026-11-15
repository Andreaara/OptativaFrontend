import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

export default function FacturaDetalles() {
    const [detalles, setDetalles] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);
    const [cfdiJson, setCfdiJson] = useState(null);

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
    const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
    const [detalleAEliminar, setDetalleAEliminar] = useState(null);

    const cargarDetalles = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/detalles');
            setDetalles(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
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
        setCargando(true);
        setErrorApi(null);

        try {
            if (editando) {
                setDetalles((prev) =>
                    prev.map((item) =>
                        item.detalle_id === formData.detalle_id ? { ...formData } : item
                    )
                );
            } else {
                // Al insertar detalle en RDS, se disparan los SP de cálculo de IVA, descuentos y actualización de encabezado
                await apiFetch('/detalles', {
                    method: 'POST',
                    body: JSON.stringify({
                        factura_id: Number(formData.factura_id),
                        servicio_id: formData.servicio_id.trim(),
                        cantidad: Number(formData.cantidad),
                        precio_unitario: parseFloat(formData.precio_unitario),
                    }),
                });
                await cargarDetalles();
            }
            resetForm();
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleAbrirEliminar = (item) => {
        setDetalleAEliminar(item);
        setModalEliminarOpen(true);
    };

    const handleConfirmarEliminar = () => {
        if (!detalleAEliminar) return;

        setDetalles((prev) =>
            prev.filter((item) => item.detalle_id !== detalleAEliminar.detalle_id)
        );

        if (formData.detalle_id === detalleAEliminar.detalle_id) {
            resetForm();
        }

        setModalEliminarOpen(false);
        setDetalleAEliminar(null);
    };

    // Ejecuta sp_obtener_cfdi_json para una factura
    const handleVerCfdi = async (facturaId) => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch(`/reportes?tipo=cfdi&factura_id=${facturaId}`);
            setCfdiJson(data);
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
                        <span className="material-symbols-outlined">description</span>
                    </span>
                    <div>
                        <h2>Detalles de Facturas</h2>
                        <p>
                            {detalles.length}{' '}
                            {detalles.length === 1 ? 'detalle registrado' : 'detalles registrados'}
                        </p>
                    </div>
                </div>
                <AddButton onClick={handleAbrirCrear}>Agregar Detalle</AddButton>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

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

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando detalles con AWS...
                </div>
            )}

            {/* TABLA */}
            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Factura ID</th>
                            <th>Servicio ID</th>
                            <th>Cantidad</th>
                            <th>P. Unitario</th>
                            <th>Subtotal</th>
                            <th className="col-acciones">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {detalles.length === 0 ? (
                            <tr>
                                <td colSpan="7">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay detalles registrados</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            detalles.map((item) => (
                                <tr key={item.detalle_id} className="fila-servicio">
                                    <td>
                                        <span className="texto-id">{item.detalle_id}</span>
                                    </td>
                                    <td>
                                        <span className="texto-id">{item.factura_id}</span>
                                    </td>
                                    <td>
                                        <span className="texto-id">{item.servicio_id}</span>
                                    </td>
                                    <td>{item.cantidad}</td>
                                    <td>${parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                                    <td>
                                        <strong>${parseFloat(item.subtotal || 0).toFixed(2)}</strong>
                                    </td>
                                    <td>
                                        <div className="acciones-tabla">
                                            <button
                                                type="button"
                                                title="Ver CFDI JSON"
                                                onClick={() => handleVerCfdi(item.factura_id)}
                                            >
                                                <span className="material-symbols-outlined">data_object</span>
                                            </button>
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

            {/* MODAL CREAR / EDITAR */}
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
                                    placeholder="Ej. E-098"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Cantidad"
                                    type="number"
                                    name="cantidad"
                                    value={formData.cantidad}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Precio Unitario ($)"
                                    type="number"
                                    step="0.01"
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

            {/* MODAL ELIMINAR */}
            {modalEliminarOpen && detalleAEliminar && (
                <div className="modal-overlay" onClick={() => setModalEliminarOpen(false)}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3 className="titulo-eliminar">
                            <span className="material-symbols-outlined">warning</span>
                            Eliminar Detalle
                        </h3>

                        <p className="texto-confirmacion">
                            ¿Seguro que deseas eliminar este detalle (
                            <span className="texto-id">{detalleAEliminar.detalle_id}</span>)? Esta acción no
                            se puede deshacer.
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