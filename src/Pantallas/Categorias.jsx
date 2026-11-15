import React, { useState, useEffect } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    const [formData, setFormData] = useState({
        categoria_id: null,
        nombre: '',
        descripcion: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cargarCategorias = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/categorias');
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
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
        setEditando(false);
        setModalOpen(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormData({
            categoria_id: item.categoria_id,
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
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
                await apiFetch('/categorias', {
                    method: 'PUT',
                    body: JSON.stringify({
                        categoria_id: formData.categoria_id,
                        nombre: formData.nombre.trim(),
                        descripcion: formData.descripcion.trim(),
                    }),
                });
            } else {
                await apiFetch('/categorias', {
                    method: 'POST',
                    body: JSON.stringify({
                        nombre: formData.nombre.trim(),
                        descripcion: formData.descripcion.trim(),
                    }),
                });
            }
            await cargarCategorias();
            resetForm();
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleDelete = async (categoria_id) => {
        if (!window.confirm('¿Deseas eliminar esta categoría?')) return;

        setCargando(true);
        setErrorApi(null);
        try {
            await apiFetch(`/categorias?id=${categoria_id}`, {
                method: 'DELETE',
            });
            await cargarCategorias();
            if (formData.categoria_id === categoria_id) resetForm();
        } catch (err) {
            setErrorApi(err.message);
            setCargando(false);
        }
    };

    return (
        <div className="pantalla-principal-container">
            {/* HEADER DE LA PANTALLA */}
            <div className="pantalla-header">
                <div className="pantalla-titulo">
                    <span className="titulo-icono">
                        <span className="material-symbols-outlined">category</span>
                    </span>
                    <div>
                        <h2>Gestión de Categorías</h2>
                        <p>
                            {categorias.length}{' '}
                            {categorias.length === 1 ? 'categoría registrada' : 'categorías registradas'}
                        </p>
                    </div>
                </div>
                <AddButton onClick={handleAbrirCrear}>Nueva Categoría</AddButton>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Sincronizando categorías con AWS...
                </div>
            )}

            {/* TABLA DE CATEGORÍAS */}
            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th className="col-acciones">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categorias.length === 0 ? (
                            <tr>
                                <td colSpan="4">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay categorías registradas</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            categorias.map((item) => (
                                <tr key={item.categoria_id} className="fila-servicio">
                                    <td>
                                        <span className="texto-id">{item.categoria_id}</span>
                                    </td>
                                    <td className="texto-nombre">{item.nombre}</td>
                                    <td>{item.descripcion}</td>
                                    <td>
                                        <div className="acciones-tabla">
                                            <EditButton onClick={() => handleEdit(item)} />
                                            <DeleteButton onClick={() => handleDelete(item.categoria_id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL PARA CREAR / EDITAR CATEGORÍA */}
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