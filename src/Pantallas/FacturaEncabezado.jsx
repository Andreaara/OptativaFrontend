import React, { useState } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import '../Estilos/Estilos.css';

export default function FacturaEncabezado() {
    const [facturas, setFacturas] = useState([]);
    const [formData, setFormData] = useState({
        factura_id: null,
        emisor_id: '',
        cliente_id: '',
        folio: '',
        fecha_emision: '',
        subtotal: '',
        impuestos: '',
        total: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
    const [facturaAEliminar, setFacturaAEliminar] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedForm = { ...formData, [name]: value };

        // Auto-calcular Total si cambia subtotal o impuestos
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editando) {
            setFacturas((prev) =>
                prev.map((item) =>
                    item.factura_id === formData.factura_id ? { ...formData } : item
                )
            );
        } else {
            const nuevaFactura = {
                ...formData,
                factura_id: Date.now().toString(),
            };
            setFacturas((prev) => [...prev, nuevaFactura]);
        }

        resetForm();
    };

    const handleAbrirEliminar = (item) => {
        setFacturaAEliminar(item);
        setModalEliminarOpen(true);
    };

    const handleConfirmarEliminar = () => {
        if (!facturaAEliminar) return;

        setFacturas((prev) =>
            prev.filter((item) => item.factura_id !== facturaAEliminar.factura_id)
        );

        if (formData.factura_id === facturaAEliminar.factura_id) {
            resetForm();
        }

        setModalEliminarOpen(false);
        setFacturaAEliminar(null);
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
                <AddButton onClick={handleAbrirCrear}>Nueva Factura</AddButton>
            </div>

            {/* TABLA DE FACTURAS */}
            <div className="tabla-contenedor">
                <table className="tabla-servicios">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Folio</th>
                        <th>Emisor ID</th>
                        <th>Cliente ID</th>
                        <th>Subtotal</th>
                        <th>Total</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {facturas.length === 0 ? (
                        <tr>
                            <td colSpan="7">
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

            {/* MODAL PARA CREAR / EDITAR FACTURA */}
            {modalOpen && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3>
              <span className="material-symbols-outlined">
                {editando ? 'edit_square' : 'post_add'}
              </span>
                            {editando ? 'Editar Factura' : 'Nueva Factura'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Emisor ID (FK)"
                                    type="number"
                                    name="emisor_id"
                                    value={formData.emisor_id}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Cliente ID (FK)"
                                    type="number"
                                    name="cliente_id"
                                    value={formData.cliente_id}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Folio"
                                    type="text"
                                    name="folio"
                                    value={formData.folio}
                                    onChange={handleChange}
                                    placeholder="FAC-001"
                                    required
                                />
                                <Input
                                    label="Fecha Emisión"
                                    type="date"
                                    name="fecha_emision"
                                    value={formData.fecha_emision}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Subtotal ($)"
                                    type="number"
                                    step="0.01"
                                    name="subtotal"
                                    value={formData.subtotal}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Impuestos ($)"
                                    type="number"
                                    step="0.01"
                                    name="impuestos"
                                    value={formData.impuestos}
                                    onChange={handleChange}
                                    required
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

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editando ? 'Guardar Cambios' : 'Crear Factura'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PARA ELIMINAR FACTURA */}
            {modalEliminarOpen && facturaAEliminar && (
                <div className="modal-overlay" onClick={() => setModalEliminarOpen(false)}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3 className="titulo-eliminar">
                            <span className="material-symbols-outlined">warning</span>
                            Eliminar Factura
                        </h3>

                        <p className="texto-confirmacion">
                            ¿Seguro que deseas eliminar la factura con folio{' '}
                            <strong>{facturaAEliminar.folio}</strong>? Esta acción no se puede deshacer.
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