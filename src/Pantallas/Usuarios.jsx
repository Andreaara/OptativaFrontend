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
  alertaCamposVacios,
  alertaSinCambios,
  confirmarEliminar,
  toast,
} from '../Utils/Alerts.js';
import '../Estilos/Estilos.css';

const GENEROS_VALIDOS = ['Masculino', 'Femenino', 'Otro'];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const rol = obtenerRolActual();

  const [formData, setFormData] = useState({
    usuario_id: null,
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    genero: '',
    telefono: '',
    fecha_nacimiento: '',
  });
  const [originalData, setOriginalData] = useState(null);

  const [editando, setEditando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await apiFetch('/usuarios');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      alertaError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'telefono' ? value.replace(/\D/g, '').slice(0, 10) : value,
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
    setOriginalData(null);
    setEditando(false);
    setModalOpen(false);
  };

  const handleAbrirCrear = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (usuario) => {
    const datos = {
      ...usuario,
      apellido_materno: usuario.apellido_materno || '',
      fecha_nacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split('T')[0] : '',
    };
    setFormData(datos);
    setOriginalData(datos);
    setEditando(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rol !== 'ADMIN') {
      alertaError('Solo el rol ADMIN puede administrar usuarios.');
      return;
    }

    const nombreValido = validarTexto(formData.nombre, 'Nombre', {
      min: 2,
      max: 100,
      soloLetras: true,
    });
    if (!nombreValido) return;

    const paternoValido = validarTexto(formData.apellido_paterno, 'Apellido Paterno', {
      min: 2,
      max: 100,
      soloLetras: true,
    });
    if (!paternoValido) return;

    let maternoValido = '';
    if (limpiarTexto(formData.apellido_materno)) {
      maternoValido = validarTexto(formData.apellido_materno, 'Apellido Materno', {
        min: 2,
        max: 100,
        soloLetras: true,
      });
      if (!maternoValido) return;
    }

    if (!GENEROS_VALIDOS.includes(formData.genero)) {
      alertaCamposVacios();
      return;
    }

    const telefonoLimpio = limpiarTexto(formData.telefono);
    if (!/^\d{10}$/.test(telefonoLimpio)) {
      alertaCamposCaracteres('El teléfono debe contener exactamente 10 dígitos numéricos.');
      return;
    }

    if (!formData.fecha_nacimiento) {
      alertaCamposVacios();
      return;
    }

    const fechaNac = new Date(formData.fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    if (isNaN(fechaNac.getTime()) || fechaNac >= hoy || edad < 18 || edad > 110) {
      alertaError('Ingresa una fecha de nacimiento válida (mayor de 18 años).');
      return;
    }

    if (
        editando &&
        originalData &&
        originalData.nombre === nombreValido &&
        originalData.apellido_paterno === paternoValido &&
        originalData.apellido_materno === maternoValido &&
        originalData.genero === formData.genero &&
        originalData.telefono === telefonoLimpio &&
        originalData.fecha_nacimiento === formData.fecha_nacimiento
    ) {
      alertaSinCambios();
      return;
    }

    setCargando(true);
    try {
      if (editando) {
        setUsuarios((prev) =>
            prev.map((u) =>
                u.usuario_id === formData.usuario_id
                    ? {
                      ...u,
                      nombre: nombreValido,
                      apellido_paterno: paternoValido,
                      apellido_materno: maternoValido,
                      genero: formData.genero,
                      telefono: telefonoLimpio,
                      fecha_nacimiento: formData.fecha_nacimiento,
                    }
                    : u
            )
        );
        resetForm();
        toast.fire({ icon: 'success', title: 'Usuario actualizado' });
      } else {
        await apiFetch('/usuarios', {
          method: 'POST',
          body: JSON.stringify({
            nombre: nombreValido,
            apellido_paterno: paternoValido,
            apellido_materno: maternoValido,
            genero: formData.genero,
            telefono: telefonoLimpio,
            fecha_nacimiento: formData.fecha_nacimiento,
          }),
        });
        resetForm();
        await alertaExito('Usuario registrado.');
        await cargarUsuarios();
      }
    } catch (err) {
      alertaError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleDelete = async (usuario_id) => {
    if (rol !== 'ADMIN') {
      alertaError('Solo el administrador puede eliminar usuarios.');
      return;
    }

    const confirmado = await confirmarEliminar();
    if (!confirmado) return;

    setCargando(true);
    try {
      await apiFetch(`/usuarios?id=${usuario_id}`, {
        method: 'DELETE',
      });
      toast.fire({ icon: 'success', title: 'Usuario eliminado' });
      if (formData.usuario_id === usuario_id) {
        resetForm();
      }
      await cargarUsuarios();
    } catch (err) {
      alertaError(err.message);
      setCargando(false);
    }
  };

  const columnas = [
    { label: 'ID' },
    { label: 'Nombre' },
    { label: 'Apellidos' },
    { label: 'Género' },
    { label: 'Teléfono' },
    { label: 'F. Nacimiento' },
    ...(rol === 'ADMIN' ? [{ label: 'Acciones', className: 'col-acciones' }] : []),
  ];

  return (
      <div className="pantalla-principal-container">
        <PageHeader
            icon="group"
            title="Gestión de Usuarios"
            subtitle={`${usuarios.length} ${usuarios.length === 1 ? 'usuario registrado' : 'usuarios registrados'}`}
        >
          {rol === 'ADMIN' && (
              <AddButton onClick={handleAbrirCrear}>Nuevo Usuario</AddButton>
          )}
        </PageHeader>

        {cargando ? (
            <div className="cargando-texto">
              <span className="spinner" /> Cargando usuarios desde AWS...
            </div>
        ) : (
            <DataTable
                columns={columnas}
                data={usuarios}
                emptyMessage="No hay usuarios registrados"
                renderRow={(u) => (
                    <tr key={u.usuario_id} className="fila-servicio">
                      <td><span className="texto-id">{u.usuario_id}</span></td>
                      <td className="texto-nombre">{u.nombre}</td>
                      <td>{u.apellido_paterno} {u.apellido_materno}</td>
                      <td><span className="chip-categoria">{u.genero}</span></td>
                      <td>{u.telefono}</td>
                      <td>{u.fecha_nacimiento ? u.fecha_nacimiento.split('T')[0] : ''}</td>
                      {rol === 'ADMIN' && (
                          <td>
                            <div className="acciones-tabla">
                              <EditButton onClick={() => handleEdit(u)} />
                              <DeleteButton onClick={() => handleDelete(u.usuario_id)} />
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
                  {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>

                <form onSubmit={handleSubmit} className="modal-form">
                  <Input
                      label="Nombre"
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      maxLength={100}
                      required
                  />

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Input
                        label="Apellido Paterno"
                        type="text"
                        name="apellido_paterno"
                        value={formData.apellido_paterno}
                        onChange={handleChange}
                        maxLength={100}
                        required
                    />
                    <Input
                        label="Apellido Materno (Opcional)"
                        type="text"
                        name="apellido_materno"
                        value={formData.apellido_materno}
                        onChange={handleChange}
                        maxLength={100}
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
                        label="Teléfono (10 dígitos)"
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="7771234567"
                        maxLength={10}
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