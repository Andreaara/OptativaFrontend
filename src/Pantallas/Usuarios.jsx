import React, { useState } from 'react';
import Input from '../Componentes/Input.jsx';
import { AddButton, EditButton, DeleteButton } from '../Componentes/Button.jsx';
import '../Estilos/Estilos.css';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const [formData, setFormData] = useState({
    usuario_id: null,
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    genero: '',
    telefono: '',
    fecha_nacimiento: '',
  });

  const [editando, setEditando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      usuario_id: null,
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      genero: '',
      telefono: '',
      fecha_nacimiento: '',
    });
    setEditando(false);
    setModalOpen(false);
  };

  const handleAbrirCrear = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (usuario) => {
    setFormData(usuario);
    setEditando(true);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editando) {
      setUsuarios((prev) =>
          prev.map((u) => (u.usuario_id === formData.usuario_id ? { ...formData } : u))
      );
    } else {
      const nuevoUsuario = {
        ...formData,
        usuario_id: Date.now().toString(),
      };
      setUsuarios((prev) => [...prev, nuevoUsuario]);
    }

    resetForm();
  };

  const handleDelete = (usuario_id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsuarios((prev) => prev.filter((u) => u.usuario_id !== usuario_id));
      if (formData.usuario_id === usuario_id) {
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
            <span className="material-symbols-outlined">group</span>
          </span>
            <div>
              <h2>Gestión de Usuarios</h2>
              <p>
                {usuarios.length} {usuarios.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
              </p>
            </div>
          </div>
          <AddButton onClick={handleAbrirCrear}>Nuevo Usuario</AddButton>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="tabla-contenedor">
          <table className="tabla-servicios">
            <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Género</th>
              <th>Teléfono</th>
              <th>F. Nacimiento</th>
              <th className="col-acciones">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="tabla-vacia">
                      <span className="material-symbols-outlined">inbox</span>
                      <span>No hay usuarios registrados</span>
                    </div>
                  </td>
                </tr>
            ) : (
                usuarios.map((u) => (
                    <tr key={u.usuario_id} className="fila-servicio">
                      <td>
                        <span className="texto-id">{u.usuario_id}</span>
                      </td>
                      <td className="texto-nombre">{u.nombre}</td>
                      <td>
                        {u.apellido_paterno} {u.apellido_materno}
                      </td>
                      <td>
                        <span className="chip-categoria">{u.genero}</span>
                      </td>
                      <td>{u.telefono}</td>
                      <td>{u.fecha_nacimiento}</td>
                      <td>
                        <div className="acciones-tabla">
                          <EditButton onClick={() => handleEdit(u)} />
                          <DeleteButton onClick={() => handleDelete(u.usuario_id)} />
                        </div>
                      </td>
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>

        {/* MODAL PARA CREAR / EDITAR USUARIO */}
        {modalOpen && (
            <div className="modal-overlay" onClick={resetForm}>
              <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                <h3>
              <span className="material-symbols-outlined">
                {editando ? 'edit_square' : 'person_add'}
              </span>
                  {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>

                <form onSubmit={handleSubmit} className="modal-form">
                  <Input
                      label="Nombre"
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                  />

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Input
                        label="Apellido Paterno"
                        type="text"
                        name="apellido_paterno"
                        value={formData.apellido_paterno}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Apellido Materno"
                        type="text"
                        name="apellido_materno"
                        value={formData.apellido_materno}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <label className="label">Género</label>
                      <select
                          name="genero"
                          value={formData.genero}
                          onChange={handleChange}
                          className="modal-input"
                          required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <Input
                        label="Teléfono"
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                  </div>

                  <Input
                      label="Fecha de Nacimiento"
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      required
                  />

                  <div className="modal-acciones">
                    <button type="button" className="btn-cancelar" onClick={resetForm}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primario">
                      {editando ? 'Guardar Cambios' : 'Crear Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}