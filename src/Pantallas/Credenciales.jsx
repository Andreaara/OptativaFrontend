import React, { useState, useEffect } from 'react';
import Input from "../Componentes/Input.jsx";
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

const ROLES_MAP = {
    1: 'Admin',
    2: 'Facturador',
    3: 'Auditor',
};

export default function Credenciales() {
    const [credenciales, setCredenciales] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    const [formData, setFormData] = useState({
        credencial_id: null,
        usuario_id: '',
        rol_id: '2',
        correo: '',
        contrasena: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const cargarCredenciales = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/credenciales');
            setCredenciales(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCredenciales();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            credencial_id: null,
            usuario_id: '',
            rol_id: '2',
            correo: '',
            contrasena: '',
        });
        setEditando(false);
        setModalOpen(false);
        setMostrarPassword(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormData({
            credencial_id: item.credencial_id,
            usuario_id: item.usuario_id,
            rol_id: String(item.rol_id || '2'),
            correo: item.correo,
            contrasena: '',
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
                setCredenciales((prev) =>
                    prev.map((item) =>
                        item.credencial_id === formData.credencial_id
                            ? { ...item, ...formData, rol_id: Number(formData.rol_id) }
                            : item
                    )
                );
            } else {
                await apiFetch('/credenciales', {
                    method: 'POST',
                    body: JSON.stringify({
                        usuario_id: Number(formData.usuario_id),
                        rol_id: Number(formData.rol_id),
                        correo: formData.correo.trim(),
                        contrasena: formData.contrasena,
                    }),
                });
                await cargarCredenciales();
            }
            resetForm();
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = (credencial_id) => {
        if (window.confirm('¿Deseas eliminar esta credencial?')) {
            setCredenciales((prev) =>
                prev.filter((item) => item.credencial_id !== credencial_id)
            );
            if (formData.credencial_id === credencial_id) {
                resetForm();
            }
        }
    };

    return (
        <div className="pantalla-principal-container">
            {/* HEADER DE LA PANTALLA */}
            <div className="pantalla-header">
                <div className="pantalla-titulo">
                    <span className="titulo-icono">
                        <span className="material-symbols-outlined">key</span>
                    </span>
                    <div>
                        <h2>Gestión de Credenciales</h2>
                        <p>
                            {credenciales.length}{' '}
                            {credenciales.length === 1 ? 'credencial registrada' : 'credenciales registradas'}
                        </p>
                    </div>
                </div>
                <AddButton onClick={handleAbrirCrear}>Nueva Credencial</AddButton>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando credenciales con AWS...
                </div>
            )}

            {/* TABLA DE CREDENCIALES */}
            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario ID</th>
                            <th>Rol</th>
                            <th>Correo Electrónico</th>
                            <th>Contraseña</th>
                            <th className="col-acciones">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {credenciales.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay credenciales registradas</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            credenciales.map((item) => (
                                <tr key={item.credencial_id} className="fila-servicio">
                                    <td>
                                        <span className="texto-id">{item.credencial_id}</span>
                                    </td>
                                    <td>
                                        <span className="texto-id">{item.usuario_id}</span>
                                    </td>
                                    <td>
                                            <span className="chip-categoria">
                                                {item.rol || ROLES_MAP[item.rol_id] || `Rol ${item.rol_id}`}
                                            </span>
                                    </td>
                                    <td className="texto-nombre">{item.correo}</td>
                                    <td>••••••••</td>
                                    <td>
                                        <div className="acciones-tabla">
                                            <EditButton onClick={() => handleEdit(item)} />
                                            <DeleteButton onClick={() => handleDelete(item.credencial_id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL PARA CREAR / EDITAR CREDENCIAL */}
            {modalOpen && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            <span className="material-symbols-outlined">
                                {editando ? 'edit_square' : 'add_moderator'}
                            </span>
                            {editando ? 'Editar Credencial' : 'Nueva Credencial'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="ID Usuario (FK)"
                                    type="number"
                                    name="usuario_id"
                                    value={formData.usuario_id}
                                    onChange={handleChange}
                                    required
                                />

                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <label className="label">Rol RBAC</label>
                                    <select
                                        name="rol_id"
                                        value={formData.rol_id}
                                        onChange={handleChange}
                                        className="modal-input"
                                        required
                                    >
                                        <option value="1">1 - Admin</option>
                                        <option value="2">2 - Facturador</option>
                                        <option value="3">3 - Auditor</option>
                                    </select>
                                </div>
                            </div>

                            <Input
                                label="Correo Electrónico"
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                            />

                            <div style={{ position: 'relative', width: '100%' }}>
                                <Input
                                    label="Contraseña"
                                    type={mostrarPassword ? 'text' : 'password'}
                                    name="contrasena"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    required={!editando}
                                />
                                <button
                                    type="button"
                                    className="btn-icono btn-icono--neutro"
                                    onClick={() => setMostrarPassword(!mostrarPassword)}
                                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        bottom: '6px',
                                    }}
                                >
                                    <span className="material-symbols-outlined">
                                        {mostrarPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editando ? 'Guardar Cambios' : 'Crear Credencial'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}