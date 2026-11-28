import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import { limpiarTexto, validarEnteroPositivo } from '../Utils/validaciones.js';
import {
    alertaExito,
    alertaError,
    alertaCamposCaracteres,
    alertaSinCambios,
    confirmarEliminar,
    toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

const ROLES_MAP = {
    1: 'Admin',
    2: 'Facturador',
    3: 'Auditor',
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PASSWORD_SEGURA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,64}$/;

export default function Credenciales() {
    const [credenciales, setCredenciales] = useState([]);
    const [cargando, setCargando] = useState(false);
    const rol = obtenerRolActual();

    const [formData, setFormData] = useState({
        credencial_id: null,
        usuario_id: '',
        rol_id: '2',
        correo: '',
        contrasena: '',
    });
    const [originalData, setOriginalData] = useState(null);

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const cargarCredenciales = async () => {
        setCargando(true);
        try {
            const data = await apiFetch('/credenciales');
            setCredenciales(Array.isArray(data) ? data : []);
        } catch (err) {
            alertaError(err.message);
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
        setOriginalData(null);
        setEditando(false);
        setModalOpen(false);
        setMostrarPassword(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        const datos = {
            credencial_id: item.credencial_id,
            usuario_id: item.usuario_id,
            rol_id: String(item.rol_id || '2'),
            correo: item.correo,
            contrasena: '',
        };
        setFormData(datos);
        setOriginalData(datos);
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rol !== 'ADMIN') {
            alertaError('Solo el rol ADMIN puede administrar credenciales.');
            return;
        }

        const usuarioIdValido = validarEnteroPositivo(formData.usuario_id, 'ID Usuario');
        if (!usuarioIdValido) return;

        const rolIdNum = Number(formData.rol_id);
        if (![1, 2, 3].includes(rolIdNum)) {
            alertaError('Selecciona un rol RBAC válido.');
            return;
        }

        const correoLimpio = limpiarTexto(formData.correo).toLowerCase();
        if (!REGEX_EMAIL.test(correoLimpio) || correoLimpio.length > 100) {
            alertaCamposCaracteres('Ingresa un correo electrónico válido.');
            return;
        }

        if (!editando || formData.contrasena !== '') {
            if (!REGEX_PASSWORD_SEGURA.test(formData.contrasena)) {
                alertaError(
                    'La contraseña debe tener entre 8 y 64 caracteres, sin espacios, con al menos 1 mayúscula, 1 minúscula y 1 número.'
                );
                return;
            }
        }

        if (
            editando &&
            originalData &&
            Number(originalData.usuario_id) === usuarioIdValido &&
            Number(originalData.rol_id) === rolIdNum &&
            originalData.correo === correoLimpio &&
            formData.contrasena === ''
        ) {
            alertaSinCambios();
            return;
        }

        setCargando(true);
        try {
            if (editando) {
                setCredenciales((prev) =>
                    prev.map((item) =>
                        item.credencial_id === formData.credencial_id
                            ? {
                                ...item,
                                usuario_id: usuarioIdValido,
                                rol_id: rolIdNum,
                                rol: ROLES_MAP[rolIdNum],
                                correo: correoLimpio,
                            }
                            : item
                    )
                );
                resetForm();
                toast.fire({ icon: 'success', title: 'Credencial actualizada' });
            } else {
                await apiFetch('/credenciales', {
                    method: 'POST',
                    body: JSON.stringify({
                        usuario_id: usuarioIdValido,
                        rol_id: rolIdNum,
                        correo: correoLimpio,
                        contrasena: formData.contrasena,
                    }),
                });
                resetForm();
                await alertaExito('Credencial creada.');
                await cargarCredenciales();
            }
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = async (credencial_id) => {
        if (rol !== 'ADMIN') {
            alertaError('Solo el administrador puede eliminar credenciales.');
            return;
        }

        const confirmado = await confirmarEliminar();
        if (!confirmado) return;

        setCredenciales((prev) =>
            prev.filter((item) => item.credencial_id !== credencial_id)
        );
        if (formData.credencial_id === credencial_id) {
            resetForm();
        }
        toast.fire({ icon: 'success', title: 'Credencial eliminada' });
    };

    const columnas = [
        { label: 'ID' },
        { label: 'Usuario ID' },
        { label: 'Rol' },
        { label: 'Correo Electrónico' },
        { label: 'Contraseña' },
        ...(rol === 'ADMIN' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
    ];

    return (
        <div className="pantalla-principal-container">
            <PageHeader
                icon="key"
                title="Gestión de Credenciales"
                subtitle={`${credenciales.length} ${credenciales.length === 1 ? 'credencial registrada' : 'credenciales registradas'}`}
            >
                {rol === 'ADMIN' && (
                    <AddButton onClick={handleAbrirCrear}>Nueva Credencial</AddButton>
                )}
            </PageHeader>

            {cargando ? (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando credenciales con AWS...
                </div>
            ) : (
                <DataTable
                    columns={columnas}
                    data={credenciales}
                    emptyMessage="No hay credenciales registradas"
                    renderRow={(item) => (
                        <tr key={item.credencial_id} className="fila-servicio">
                            <td><span className="texto-id">{item.credencial_id}</span></td>
                            <td><span className="texto-id">{item.usuario_id}</span></td>
                            <td>
                                <span className="chip-categoria">
                                    {item.rol || ROLES_MAP[item.rol_id] || `Rol ${item.rol_id}`}
                                </span>
                            </td>
                            <td className="texto-nombre">{item.correo}</td>
                            <td>••••••••</td>
                            {rol === 'ADMIN' && (
                                <td>
                                    <div className="acciones-tabla">
                                        <EditButton onClick={() => handleEdit(item)} />
                                        <DeleteButton onClick={() => handleDelete(item.credencial_id)} />
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
                                {editando ? 'edit_square' : 'add_moderator'}
                            </span>
                            {editando ? 'Editar Credencial' : 'Nueva Credencial'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="ID Usuario (FK)"
                                    type="number"
                                    min="1"
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
                                maxLength={100}
                                required
                            />

                            <div style={{ position: 'relative', width: '100%' }}>
                                <Input
                                    label={editando ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                                    type={mostrarPassword ? 'text' : 'password'}
                                    name="contrasena"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    maxLength={64}
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