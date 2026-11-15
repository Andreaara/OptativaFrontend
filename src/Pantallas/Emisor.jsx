import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

export default function Emisor() {
    const [emisores, setEmisores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    const [formData, setFormData] = useState({
        emisor_id: null,
        usuario_id: '',
        rfc: '',
        razon_social: '',
        regimen_fiscal: '',
        email: '',
        direccion: '',
        activo: true,
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarEmisores = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/emisores');
            setEmisores(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarEmisores();
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
            emisor_id: null,
            usuario_id: '',
            rfc: '',
            razon_social: '',
            regimen_fiscal: '',
            email: '',
            direccion: '',
            activo: true,
        });
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (emisor) => {
        setFormData({
            ...emisor,
            activo: Boolean(emisor.activo),
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
                setEmisores((prev) =>
                    prev.map((item) =>
                        item.emisor_id === formData.emisor_id ? { ...formData } : item
                    )
                );
            } else {
                await apiFetch('/emisores', {
                    method: 'POST',
                    body: JSON.stringify({
                        usuario_id: Number(formData.usuario_id),
                        rfc: formData.rfc.toUpperCase(),
                        razon_social: formData.razon_social,
                        regimen_fiscal: formData.regimen_fiscal,
                        email: formData.email,
                        direccion: formData.direccion,
                        activo: formData.activo ? 1 : 0,
                    }),
                });
                await cargarEmisores();
            }
            resetForm();
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = (emisor_id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este emisor?')) {
            setEmisores((prev) => prev.filter((item) => item.emisor_id !== emisor_id));
            if (formData.emisor_id === emisor_id) {
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
                        <span className="material-symbols-outlined">domain</span>
                    </span>
                    <div>
                        <h2>Gestión de Emisores</h2>
                        <p>
                            {emisores.length}{' '}
                            {emisores.length === 1 ? 'emisor registrado' : 'emisores registrados'}
                        </p>
                    </div>
                </div>
                <AddButton onClick={handleAbrirCrear}>Nuevo Emisor</AddButton>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Cargando emisores desde AWS...
                </div>
            )}

            {/* TABLA */}
            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario ID</th>
                            <th>RFC</th>
                            <th>Razón Social</th>
                            <th>Régimen</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th className="col-acciones">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {emisores.length === 0 ? (
                            <tr>
                                <td colSpan="8">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay emisores registrados</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            emisores.map((item) => (
                                <tr key={item.emisor_id} className="fila-servicio">
                                    <td>
                                        <span className="texto-id">{item.emisor_id}</span>
                                    </td>
                                    <td>
                                        <span className="texto-id">{item.usuario_id}</span>
                                    </td>
                                    <td className="texto-nombre">{item.rfc}</td>
                                    <td>{item.razon_social}</td>
                                    <td>{item.regimen_fiscal}</td>
                                    <td>{item.email}</td>
                                    <td>
                                            <span className="chip-categoria">
                                                {item.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                    </td>
                                    <td>
                                        <div className="acciones-tabla">
                                            <EditButton onClick={() => handleEdit(item)} />
                                            <DeleteButton onClick={() => handleDelete(item.emisor_id)} />
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
                                {editando ? 'edit_square' : 'add_business'}
                            </span>
                            {editando ? 'Editar Emisor' : 'Nuevo Emisor'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Usuario ID (FK)"
                                    type="number"
                                    name="usuario_id"
                                    value={formData.usuario_id}
                                    onChange={handleChange}
                                    placeholder="Ej. 1"
                                    required
                                />
                                <Input
                                    label="RFC"
                                    type="text"
                                    name="rfc"
                                    value={formData.rfc}
                                    onChange={handleChange}
                                    placeholder="XAXX010101000"
                                    required
                                />
                            </div>

                            <Input
                                label="Razón Social"
                                type="text"
                                name="razon_social"
                                value={formData.razon_social}
                                onChange={handleChange}
                                placeholder="Empresa S.A. de C.V."
                                required
                            />

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Régimen Fiscal"
                                    type="text"
                                    name="regimen_fiscal"
                                    value={formData.regimen_fiscal}
                                    onChange={handleChange}
                                    placeholder="601 - General de Ley"
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contacto@emisor.com"
                                    required
                                />
                            </div>

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
                                <span>Emisor Activo</span>
                            </label>

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editando ? 'Guardar Cambios' : 'Crear Emisor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}