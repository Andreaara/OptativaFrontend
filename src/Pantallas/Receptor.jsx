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
    alertaSinCambios,
    confirmarEliminar,
    toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

const REGEX_RFC = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Receptor() {
    const [receptores, setReceptores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const rol = obtenerRolActual();

    const [formData, setFormData] = useState({
        cliente_id: null,
        rfc: '',
        razon_social: '',
        email: '',
        direccion: '',
        activo: true,
        fecha_creacion: '',
    });
    const [originalData, setOriginalData] = useState(null);

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarReceptores = async () => {
        setCargando(true);
        try {
            const data = await apiFetch('/receptores');
            setReceptores(Array.isArray(data) ? data : []);
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarReceptores();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const resetForm = () => {
        setFormData({
            cliente_id: null,
            rfc: '',
            razon_social: '',
            email: '',
            direccion: '',
            activo: true,
            fecha_creacion: '',
        });
        setOriginalData(null);
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (receptor) => {
        const datos = {
            ...receptor,
            activo: Boolean(receptor.activo),
            fecha_creacion: receptor.fecha_creacion ? receptor.fecha_creacion.split('T')[0] : '',
        };
        setFormData(datos);
        setOriginalData(datos);
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const rfcLimpio = limpiarTexto(formData.rfc).toUpperCase();
        if (!REGEX_RFC.test(rfcLimpio)) {
            alertaCamposCaracteres('El RFC debe tener 12 o 13 caracteres válidos (ej. XAXX010101000).');
            return;
        }

        const emailLimpio = limpiarTexto(formData.email).toLowerCase();
        if (!REGEX_EMAIL.test(emailLimpio) || emailLimpio.length > 100) {
            alertaCamposCaracteres('Ingresa un correo electrónico válido.');
            return;
        }

        const razonValida = validarTexto(formData.razon_social, 'Razón Social', {
            min: 3,
            max: 150,
        });
        if (!razonValida) return;

        const direccionValida = validarTexto(formData.direccion, 'Dirección', {
            min: 5,
            max: 250,
        });
        if (!direccionValida) return;

        if (
            editando &&
            originalData &&
            originalData.rfc === rfcLimpio &&
            originalData.email === emailLimpio &&
            originalData.razon_social === razonValida &&
            originalData.direccion === direccionValida &&
            originalData.activo === formData.activo
        ) {
            alertaSinCambios();
            return;
        }

        setCargando(true);
        try {
            if (editando) {
                setReceptores((prev) =>
                    prev.map((item) =>
                        item.cliente_id === formData.cliente_id
                            ? {
                                ...item,
                                rfc: rfcLimpio,
                                email: emailLimpio,
                                razon_social: razonValida,
                                direccion: direccionValida,
                                activo: formData.activo ? 1 : 0,
                            }
                            : item
                    )
                );
                resetForm();
                toast.fire({ icon: 'success', title: 'Receptor actualizado' });
            } else {
                await apiFetch('/receptores', {
                    method: 'POST',
                    body: JSON.stringify({
                        rfc: rfcLimpio,
                        razon_social: razonValida,
                        email: emailLimpio,
                        direccion: direccionValida,
                        activo: formData.activo ? 1 : 0,
                    }),
                });
                resetForm();
                await alertaExito('Receptor registrado correctamente.');
                await cargarReceptores();
            }
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = async (cliente_id) => {
        if (rol !== 'ADMIN') {
            alertaError('Solo el rol ADMIN puede eliminar receptores.');
            return;
        }

        const confirmado = await confirmarEliminar();
        if (!confirmado) return;

        setReceptores((prev) => prev.filter((item) => item.cliente_id !== cliente_id));
        if (formData.cliente_id === cliente_id) {
            resetForm();
        }
        toast.fire({ icon: 'success', title: 'Receptor eliminado' });
    };

    const columnas = [
        { label: 'ID Cliente' },
        { label: 'RFC' },
        { label: 'Razón Social' },
        { label: 'Email' },
        { label: 'Dirección' },
        { label: 'Estado' },
        ...(rol === 'ADMIN' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
    ];

    return (
        <div className="pantalla-principal-container">
            <PageHeader
                icon="person_pin_circle"
                title="Gestión de Receptores (Clientes)"
                subtitle={`${receptores.length} ${receptores.length === 1 ? 'receptor registrado' : 'receptores registrados'}`}
            >
                {rol !== 'AUDITOR' && (
                    <AddButton onClick={handleAbrirCrear}>Nuevo Receptor</AddButton>
                )}
            </PageHeader>

            {cargando ? (
                <div className="cargando-texto">
                    <span className="spinner" /> Cargando receptores desde AWS...
                </div>
            ) : (
                <DataTable
                    columns={columnas}
                    data={receptores}
                    emptyMessage="No hay receptores registrados"
                    renderRow={(item) => (
                        <tr key={item.cliente_id} className="fila-servicio">
                            <td><span className="texto-id">{item.cliente_id}</span></td>
                            <td className="texto-nombre">{item.rfc}</td>
                            <td>{item.razon_social}</td>
                            <td>{item.email}</td>
                            <td>{item.direccion}</td>
                            <td>
                                <span className="chip-categoria">
                                    {item.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            {rol === 'ADMIN' && (
                                <td>
                                    <div className="acciones-tabla">
                                        <EditButton onClick={() => handleEdit(item)} />
                                        <DeleteButton onClick={() => handleDelete(item.cliente_id)} />
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
                                {editando ? 'edit_square' : 'person_add'}
                            </span>
                            {editando ? 'Editar Receptor' : 'Nuevo Receptor'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="RFC"
                                    type="text"
                                    name="rfc"
                                    value={formData.rfc}
                                    onChange={handleChange}
                                    placeholder="XAXX010101000"
                                    maxLength={13}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="cliente@ejemplo.com"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <Input
                                label="Razón Social"
                                type="text"
                                name="razon_social"
                                value={formData.razon_social}
                                onChange={handleChange}
                                placeholder="Nombre o empresa del cliente"
                                maxLength={150}
                                required
                            />

                            <Input
                                label="Dirección"
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Calle, número, colonia, CP"
                                maxLength={250}
                                required
                            />

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                />
                                <span>Receptor Activo</span>
                            </label>

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editando ? 'Guardar Cambios' : 'Crear Receptor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}