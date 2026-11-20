import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import {
    limpiarTexto,
    validarTexto,
    validarEnteroPositivo,
} from '../Utils/validaciones.js';
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

export default function Emisor() {
    const [emisores, setEmisores] = useState([]);
    const [cargando, setCargando] = useState(false);
    const rol = obtenerRolActual();

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
    const [originalData, setOriginalData] = useState(null);

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarEmisores = async () => {
        setCargando(true);
        try {
            const data = await apiFetch('/emisores');
            setEmisores(Array.isArray(data) ? data : []);
        } catch (err) {
            alertaError(err.message);
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
        setOriginalData(null);
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (emisor) => {
        const datos = {
            ...emisor,
            activo: Boolean(emisor.activo),
        };
        setFormData(datos);
        setOriginalData(datos);
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rol !== 'ADMIN') {
            alertaError('Solo el rol ADMIN puede administrar los datos del emisor.');
            return;
        }

        const usuarioIdValido = validarEnteroPositivo(formData.usuario_id, 'Usuario ID');
        if (!usuarioIdValido) return;

        const rfcLimpio = limpiarTexto(formData.rfc).toUpperCase();
        if (!REGEX_RFC.test(rfcLimpio)) {
            alertaCamposCaracteres('El RFC debe tener 12 o 13 caracteres válidos (ej. XAXX010101000).');
            return;
        }

        const razonValida = validarTexto(formData.razon_social, 'Razón Social', {
            min: 3,
            max: 150,
        });
        if (!razonValida) return;

        const regimenValido = validarTexto(formData.regimen_fiscal, 'Régimen Fiscal', {
            min: 3,
            max: 100,
        });
        if (!regimenValido) return;

        const emailLimpio = limpiarTexto(formData.email).toLowerCase();
        if (!REGEX_EMAIL.test(emailLimpio) || emailLimpio.length > 100) {
            alertaCamposCaracteres('Ingresa un correo electrónico válido.');
            return;
        }

        const direccionValida = validarTexto(formData.direccion, 'Dirección', {
            min: 5,
            max: 250,
        });
        if (!direccionValida) return;

        if (
            editando &&
            originalData &&
            Number(originalData.usuario_id) === usuarioIdValido &&
            originalData.rfc === rfcLimpio &&
            originalData.razon_social === razonValida &&
            originalData.regimen_fiscal === regimenValido &&
            originalData.email === emailLimpio &&
            originalData.direccion === direccionValida &&
            originalData.activo === formData.activo
        ) {
            alertaSinCambios();
            return;
        }

        setCargando(true);
        try {
            if (editando) {
                setEmisores((prev) =>
                    prev.map((item) =>
                        item.emisor_id === formData.emisor_id
                            ? {
                                ...item,
                                usuario_id: usuarioIdValido,
                                rfc: rfcLimpio,
                                razon_social: razonValida,
                                regimen_fiscal: regimenValido,
                                email: emailLimpio,
                                direccion: direccionValida,
                                activo: formData.activo ? 1 : 0,
                            }
                            : item
                    )
                );
                resetForm();
                toast.fire({ icon: 'success', title: 'Emisor actualizado' });
            } else {
                await apiFetch('/emisores', {
                    method: 'POST',
                    body: JSON.stringify({
                        usuario_id: usuarioIdValido,
                        rfc: rfcLimpio,
                        razon_social: razonValida,
                        regimen_fiscal: regimenValido,
                        email: emailLimpio,
                        direccion: direccionValida,
                        activo: formData.activo ? 1 : 0,
                    }),
                });
                resetForm();
                await alertaExito('Emisor registrado correctamente.');
                await cargarEmisores();
            }
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = async (emisor_id) => {
        if (rol !== 'ADMIN') {
            alertaError('Solo el rol ADMIN puede eliminar emisores.');
            return;
        }

        const confirmado = await confirmarEliminar();
        if (!confirmado) return;

        setEmisores((prev) => prev.filter((item) => item.emisor_id !== emisor_id));
        if (formData.emisor_id === emisor_id) {
            resetForm();
        }
        toast.fire({ icon: 'success', title: 'Emisor eliminado' });
    };

    const columnas = [
        { label: 'ID' },
        { label: 'Usuario ID' },
        { label: 'RFC' },
        { label: 'Razón Social' },
        { label: 'Régimen' },
        { label: 'Email' },
        { label: 'Estado' },
        ...(rol === 'ADMIN' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
    ];

    return (
        <div className="pantalla-principal-container">
            <PageHeader
                icon="domain"
                title="Gestión de Emisores"
                subtitle={`${emisores.length} ${emisores.length === 1 ? 'emisor registrado' : 'emisores registrados'}`}
            >
                {rol === 'ADMIN' && (
                    <AddButton onClick={handleAbrirCrear}>Nuevo Emisor</AddButton>
                )}
            </PageHeader>

            {cargando ? (
                <div className="cargando-texto">
                    <span className="spinner" /> Cargando emisores desde AWS...
                </div>
            ) : (
                <DataTable
                    columns={columnas}
                    data={emisores}
                    emptyMessage="No hay emisores registrados"
                    renderRow={(item) => (
                        <tr key={item.emisor_id} className="fila-servicio">
                            <td><span className="texto-id">{item.emisor_id}</span></td>
                            <td><span className="texto-id">{item.usuario_id}</span></td>
                            <td className="texto-nombre">{item.rfc}</td>
                            <td>{item.razon_social}</td>
                            <td>{item.regimen_fiscal}</td>
                            <td>{item.email}</td>
                            <td>
                                <span className="chip-categoria">
                                    {item.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            {rol === 'ADMIN' && (
                                <td>
                                    <div className="acciones-tabla">
                                        <EditButton onClick={() => handleEdit(item)} />
                                        <DeleteButton onClick={() => handleDelete(item.emisor_id)} />
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
                                {editando ? 'edit_square' : 'add_business'}
                            </span>
                            {editando ? 'Editar Emisor' : 'Nuevo Emisor'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Input
                                    label="Usuario ID (FK)"
                                    type="number"
                                    min="1"
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
                                    maxLength={13}
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
                                maxLength={150}
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
                                    maxLength={100}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contacto@emisor.com"
                                    maxLength={100}
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