import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import {
    validarEnteroPositivo,
    validarMontoPositivo,
} from '../Utils/validaciones.js';
import {
    alertaExito,
    alertaError,
    alertaCamposVacios,
    confirmarEliminar,
    toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

const TIPOS_TARJETA_VALIDOS = ['Crédito', 'Débito', 'Prepago', 'Corporativa', 'Transferencia'];

export default function Pagos() {
    const [pagos, setPagos] = useState([]);
    const [facturas, setFacturas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [antiguedad, setAntiguedad] = useState(null);
    const rol = obtenerRolActual();

    const [formData, setFormData] = useState({
        pago_id: null,
        factura_id: '',
        monto: '',
        tipo_tarjeta: '',
        fecha_pago: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [dataPagos, dataFacturas] = await Promise.all([
                apiFetch('/pagos'),
                apiFetch('/facturas').catch(() => []),
            ]);
            setPagos(Array.isArray(dataPagos) ? dataPagos : []);
            setFacturas(Array.isArray(dataFacturas) ? dataFacturas : []);
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            // Si elige una factura nueva y el monto está vacío, autocompleta su total
            if (name === 'factura_id' && !editando) {
                const fac = facturas.find((f) => String(f.factura_id) === String(value));
                if (fac && parseFloat(fac.total) > 0) {
                    next.monto = parseFloat(fac.total).toFixed(2);
                }
            }
            return next;
        });
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
        setFormData({
            pago_id: pago.pago_id,
            factura_id: String(pago.factura_id),
            monto: String(pago.monto),
            tipo_tarjeta: pago.tipo_tarjeta || '',
            fecha_pago: pago.fecha_pago || '',
        });
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const facturaIdValido = validarEnteroPositivo(formData.factura_id, 'Factura');
        if (!facturaIdValido) return;

        const montoValido = validarMontoPositivo(formData.monto, 'Monto');
        if (!montoValido) return;

        if (!TIPOS_TARJETA_VALIDOS.includes(formData.tipo_tarjeta)) {
            alertaCamposVacios();
            return;
        }

        setCargando(true);
        try {
            if (editando) {
                await apiFetch('/pagos', {
                    method: 'PUT',
                    body: JSON.stringify({
                        pago_id: formData.pago_id,
                        factura_id: facturaIdValido,
                        monto: montoValido,
                        tipo_tarjeta: formData.tipo_tarjeta,
                    }),
                });
                resetForm();
                await alertaExito('Pago actualizado y estatus de factura recalculado.');
                await cargarDatos();
            } else {
                await apiFetch('/pagos', {
                    method: 'POST',
                    body: JSON.stringify({
                        factura_id: facturaIdValido,
                        monto: montoValido,
                        tipo_tarjeta: formData.tipo_tarjeta,
                    }),
                });
                resetForm();
                await alertaExito('Pago registrado y estatus de factura validado.');
                await cargarDatos();
            }
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = async (pago_id) => {
        if (rol !== 'ADMIN') {
            alertaError('Solo el administrador puede eliminar pagos registrados.');
            return;
        }

        const confirmado = await confirmarEliminar();
        if (!confirmado) return;

        setCargando(true);
        try {
            await apiFetch(`/pagos?id=${pago_id}`, {
                method: 'DELETE',
            });
            if (formData.pago_id === pago_id) {
                resetForm();
            }
            toast.fire({ icon: 'success', title: 'Registro de pago eliminado' });
            await cargarDatos();
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleVerAntiguedad = async () => {
        setCargando(true);
        try {
            const data = await apiFetch('/reportes?tipo=antiguedad');
            setAntiguedad(Array.isArray(data) ? data : []);
            toast.fire({ icon: 'success', title: 'Reporte de antigüedad generado' });
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const columnas = [
        { label: 'ID Pago' },
        { label: 'ID Factura' },
        { label: 'Monto' },
        { label: 'Método / Tarjeta' },
        { label: 'Fecha de Pago' },
        ...(rol !== 'AUDITOR' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
    ];

    return (
        <div className="pantalla-principal-container">
            <PageHeader
                icon="payments"
                title="Gestión de Pagos"
                subtitle={`${pagos.length} ${pagos.length === 1 ? 'pago registrado' : 'pagos registrados'}`}
            >
                <button type="button" className="btn-cancelar" onClick={handleVerAntiguedad}>
                    Antigüedad Saldos (SP)
                </button>
                {rol !== 'AUDITOR' && (
                    <AddButton onClick={handleAbrirCrear}>Registrar Pago</AddButton>
                )}
            </PageHeader>

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
                                    Folio <strong>{f.folio}</strong> ({f.cliente}) | Total:{' '}
                                    <strong>${parseFloat(f.total || 0).toFixed(2)}</strong> | Días vencidos:{' '}
                                    <strong>{f.dias_antiguedad ?? 0}</strong> ({f.categoria_vencimiento || 'Vigente'})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {cargando ? (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando pagos...
                </div>
            ) : (
                <DataTable
                    columns={columnas}
                    data={pagos}
                    emptyMessage="No hay pagos registrados"
                    renderRow={(item) => (
                        <tr key={item.pago_id} className="fila-servicio">
                            <td><span className="texto-id">{item.pago_id}</span></td>
                            <td><span className="texto-id">{item.factura_id}</span></td>
                            <td><strong>${parseFloat(item.monto || 0).toFixed(2)}</strong></td>
                            <td><span className="chip-categoria">{item.tipo_tarjeta}</span></td>
                            <td>
                                {item.fecha_pago
                                    ? new Date(item.fecha_pago).toLocaleString()
                                    : 'Recién registrado'}
                            </td>
                            {rol !== 'AUDITOR' && (
                                <td>
                                    <div className="acciones-tabla">
                                        <EditButton onClick={() => handleEdit(item)} />
                                        {rol === 'ADMIN' && (
                                            <DeleteButton onClick={() => handleDelete(item.pago_id)} />
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    )}
                />
            )}

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
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <label className="label">Factura</label>
                                <select
                                    name="factura_id"
                                    value={formData.factura_id}
                                    onChange={handleChange}
                                    className="modal-input"
                                    required
                                >
                                    <option value="">Seleccionar factura...</option>
                                    {facturas
                                        .filter((f) => f.estatus !== 'CANCELADA' || String(f.factura_id) === String(formData.factura_id))
                                        .map((f) => (
                                            <option key={f.factura_id} value={f.factura_id}>
                                                #{f.factura_id} - {f.folio} | Total: ${parseFloat(f.total || 0).toFixed(2)} ({f.estatus})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Monto ($)"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                />

                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <label className="label">Método / Tipo de Tarjeta</label>
                                    <select
                                        name="tipo_tarjeta"
                                        value={formData.tipo_tarjeta}
                                        onChange={handleChange}
                                        className="modal-input"
                                        required
                                    >
                                        <option value="">Seleccionar método...</option>
                                        {TIPOS_TARJETA_VALIDOS.map((tipo) => (
                                            <option key={tipo} value={tipo}>
                                                {tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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