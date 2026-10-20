import React, { useState } from 'react';
import Input from "../Componentes/Input.jsx";
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import '../Estilos/Estilos.css';

export default function Credenciales() {
    const [credenciales, setCredenciales] = useState([]);
    const [formData, setFormData] = useState({
        credencial_id: null,
        usuario_id: '',
        correo: '',
        contraseña: '',
    });

    const [editando, setEditando] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            credencial_id: null,
            usuario_id: '',
            correo: '',
            contraseña: '',
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
        setFormData(item);
        setEditando(true);
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editando) {
            setCredenciales((prev) =>
                prev.map((item) =>
                    item.credencial_id === formData.credencial_id ? { ...formData } : item
                )
            );
        } else {
            const nuevaCredencial = {
                ...formData,
                credencial_id: Date.now().toString(),
            };
            setCredenciales((prev) => [...prev, nuevaCredencial]);
        }

        resetForm();
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

            {/* TABLA DE CREDENCIALES */}
            <div className="tabla-contenedor">
                <table className="tabla-servicios">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario ID</th>
                        <th>Correo Electrónico</th>
                        <th>Contraseña</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {credenciales.length === 0 ? (
                        <tr>
                            <td colSpan="5">
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
                            <Input
                                label="ID Usuario (FK)"
                                type="number"
                                name="usuario_id"
                                value={formData.usuario_id}
                                onChange={handleChange}
                                required
                            />

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
                                    name="contraseña"
                                    value={formData.contraseña}
                                    onChange={handleChange}
                                    required
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