import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import PageHeader from '../Componentes/PageHeader.jsx';
import DataTable from '../Componentes/DataTable.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import { obtenerRolActual } from '../Routes/Protectedroutes.jsx';
import { validarTexto } from '../Utils/validaciones.js';
import {
    alertaExito,
    alertaError,
    alertaSinCambios,
    confirmarEliminar,
    toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const rol = obtenerRolActual();

    const [formData, setFormData] = useState({
        categoria_id: null,
        nombre: '',
        descripcion: '',
    });
    const [originalData, setOriginalData] = useState(null);

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarCategorias = async () => {
        setCargando(true);
        try {
            const data = await apiFetch('/categorias');
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ categoria_id: null, nombre: '', descripcion: '' });
        setOriginalData(null);
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        const datos = {
            categoria_id: item.categoria_id,
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
        };
        setFormData(datos);
        setOriginalData(datos);
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rol !== 'ADMIN') {
            alertaError('Solo el rol ADMIN puede administrar categorías.');
            return;
        }

        const nombreValido = validarTexto(formData.nombre, 'Nombre de la Categoría', {
            min: 3,
            max: 100,
        });
        if (!nombreValido) return;

        const descripcionValida = validarTexto(formData.descripcion, 'Descripción', {
            min: 5,
            max: 250,
        });
        if (!descripcionValida) return;

        if (
            editando &&
            originalData &&
            originalData.nombre === nombreValido &&
            originalData.descripcion === descripcionValida
        ) {
            alertaSinCambios();
            return;
        }

        setCargando(true);
        try {
            if (editando) {
                await apiFetch('/categorias', {
                    method: 'PUT',
                    body: JSON.stringify({
                        categoria_id: formData.categoria_id,
                        nombre: nombreValido,
                        descripcion: descripcionValida,
                    }),
                });
                resetForm();
                await alertaExito('Categoría actualizada correctamente.');
            } else {
                await apiFetch('/categorias', {
                    method: 'POST',
                    body: JSON.stringify({
                        nombre: nombreValido,
                        descripcion: descripcionValida,
                    }),
                });
                resetForm();
                await alertaExito('Categoría creada correctamente.');
            }
            await cargarCategorias();
        } catch (err) {
            alertaError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = async (categoria_id) => {
        if (rol !== 'ADMIN') {
            alertaError('Solo el rol ADMIN puede eliminar categorías.');
            return;
        }

        const confirmado = await confirmarEliminar();
        if (!confirmado) return;

        setCargando(true);
        try {
            await apiFetch(`/categorias?id=${categoria_id}`, {
                method: 'DELETE',
            });
            toast.fire({ icon: 'success', title: 'Categoría eliminada' });
            if (formData.categoria_id === categoria_id) resetForm();
            await cargarCategorias();
        } catch (err) {
            alertaError(err.message);
            setCargando(false);
        }
    };

    const columnas = [
        { label: 'ID' },
        { label: 'Nombre' },
        { label: 'Descripción' },
        ...(rol === 'ADMIN' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
    ];

    return (
        <div className="pantalla-principal-container">
            <PageHeader
                icon="category"
                title="Gestión de Categorías"
                subtitle={`${categorias.length} ${categorias.length === 1 ? 'categoría registrada' : 'categorías registradas'}`}
            >
                {rol === 'ADMIN' && (
                    <AddButton onClick={handleAbrirCrear}>Nueva Categoría</AddButton>
                )}
            </PageHeader>

            {cargando ? (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando categorías con AWS...
                </div>
            ) : (
                <DataTable
                    columns={columnas}
                    data={categorias}
                    emptyMessage="No hay categorías registradas"
                    renderRow={(item) => (
                        <tr key={item.categoria_id} className="fila-servicio">
                            <td><span className="texto-id">{item.categoria_id}</span></td>
                            <td className="texto-nombre">{item.nombre}</td>
                            <td>{item.descripcion}</td>
                            {rol === 'ADMIN' && (
                                <td>
                                    <div className="acciones-tabla">
                                        <EditButton onClick={() => handleEdit(item)} />
                                        <DeleteButton onClick={() => handleDelete(item.categoria_id)} />
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
                                {editando ? 'edit_square' : 'add_circle'}
                            </span>
                            {editando ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h3>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <Input
                                label="Nombre de la Categoría"
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />

                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <label className="label">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className="modal-input"
                                    style={{ height: '80px', resize: 'vertical' }}
                                    maxLength={250}
                                    required
                                />
                            </div>

                            <div className="modal-acciones">
                                <button type="button" className="btn-cancelar" onClick={resetForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primario">
                                    {editando ? 'Guardar Cambios' : 'Crear Categoría'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}