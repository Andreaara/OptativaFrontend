import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

export default function Receptor() {
    const [receptores, setReceptores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    const [formData, setFormData] = useState({
        cliente_id: null,
        rfc: '',
        razon_social: '',
        email: '',
        direccion: '',
        activo: true,
        fecha_creacion: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarReceptores = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/receptores');
            setReceptores(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
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
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (receptor) => {
        setFormData({
            ...receptor,
            activo: Boolean(receptor.activo),
            fecha_creacion: receptor.fecha_creacion ? receptor.fecha_creacion.split('T')[0] : '',
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
                setReceptores((prev) =>
                    prev.map((item) =>
                        item.cliente_id === formData.cliente_id ? { ...formData } : item
                    )
                );
            } else {
                await apiFetch('/receptores', {
                    method: 'POST',
                    body: JSON.stringify({
                        rfc: formData.rfc.toUpperCase(),
                        razon_social: formData.razon_social,
                        email: formData.email,
                        direccion: formData.direccion,
                        activo: formData.activo ? 1 : 0,
                    }),
                });
                await cargarReceptores();
            }
            resetForm();
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = (cliente_id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este receptor?')) {
            setReceptores((prev) => prev.filter((item) => item.cliente_id !== cliente_id));
            if (formData.cliente_id === cliente_id) {
                resetForm();
            }
        }
    };

    return (
        <div className="pantalla-principal-container">
            {/* HEADER */}
            <div className="pantalla-header">
                <div className="pantalla-titulo">
                    <span className="titulo-icono">
                        <span className="material-symbols-outlined">person_pin_circle</span>
                    </span>
                    <div>
                        <h2>Gestión de Receptores (Clientes)</h2>
                        <p>
                            {receptores.length}{' '}
                            {receptores.length === 1 ? 'receptor registrado' : 'receptores registrados'}
                        </p>
                    </div>
                </div>
                <AddButton onClick={handleAbrirCrear}>Nuevo Receptor</AddButton>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Cargando receptores desde AWS...
                </div>
            )}

            {/* TABLA */}
            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>ID Cliente</th>
                            <th>RFC</th>
                            <th>Razón Social</th>
                            <th>Email</th>
                            <th>Dirección</th>
                            <th>Estado</th>
                            <th className="col-acciones">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {receptores.length === 0 ? (
                            <tr>
                                <td colSpan="7">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay receptores registrados</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            receptores.map((item) => (
                                <tr key={item.cliente_id} className="fila-servicio">
                                    <td>
                                        <span className="texto-id">{item.cliente_id}</span>
                                    </td>
                                    <td className="texto-nombre">{item.rfc}</td>
                                    <td>{item.razon_social}</td>
                                    <td>{item.email}</td>
                                    <td>{item.direccion}</td>
                                    <td>
                                            <span className="chip-categoria">
                                                {item.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="acciones-tabla">
                                            <EditButton onClick={() => handleEdit(item)} />
                                            <DeleteButton onClick={() => handleDelete(item.cliente_id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL */}
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
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="cliente@ejemplo.com"
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
                                required
                            />

                            <Input
                                label="Dirección"
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Calle, número, colonia, CP"
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