import React, { useState } from 'react';


export default function Receptor() {
    // Estado para la lista de receptores (sin datos iniciales)
    const [receptores, setReceptores] = useState([]);


    // Estado del formulario
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


    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };


    // Limpiar formulario
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
    };


    // Crear o Editar Receptor
    const handleSubmit = (e) => {
        e.preventDefault();


        if (editando) {
            setReceptores(
                receptores.map((item) =>
                    item.cliente_id === formData.cliente_id ? { ...formData } : item
                )
            );
        } else {
            const nuevoReceptor = {
                ...formData,
                cliente_id: Date.now(), // Generación de ID único simulado
                // Si no selecciona fecha, se asigna la fecha actual por defecto
                fecha_creacion: formData.fecha_creacion || new Date().toISOString().split('T')[0],
            };
            setReceptores([...receptores, nuevoReceptor]);
        }


        resetForm();
    };


    // Cargar datos para edición
    const handleEdit = (receptor) => {
        setFormData(receptor);
        setEditando(true);
    };


    // Eliminar registro
    const handleDelete = (cliente_id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este receptor?')) {
            setReceptores(receptores.filter((item) => item.cliente_id !== cliente_id));
            if (formData.cliente_id === cliente_id) {
                resetForm();
            }
        }
    };


    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Gestión de Receptores</h1>


            <div style={styles.content}>
                {/* FORMULARIO DE CREAR / EDITAR */}
                <div style={styles.card}>
                    <h2 style={styles.subtitle}>
                        {editando ? 'Editar Receptor' : 'Crear Nuevo Receptor'}
                    </h2>


                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>RFC</label>
                            <input
                                type="text"
                                name="rfc"
                                value={formData.rfc}
                                onChange={handleChange}
                                placeholder="XAXX010101000"
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Razón Social</label>
                            <input
                                type="text"
                                name="razon_social"
                                value={formData.razon_social}
                                onChange={handleChange}
                                placeholder="Nombre o razón social del cliente"
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="cliente@ejemplo.com"
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Dirección</label>
                            <textarea
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Calle, número, colonia, CP, etc."
                                style={{ ...styles.input, height: '60px', resize: 'vertical' }}
                                required
                            />
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Fecha de Creación</label>
                            <input
                                type="date"
                                name="fecha_creacion"
                                value={formData.fecha_creacion}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="activo"
                                name="activo"
                                checked={formData.activo}
                                onChange={handleChange}
                                style={styles.checkbox}
                            />
                            <label htmlFor="activo" style={styles.checkboxLabel}>
                                Receptor Activo
                            </label>
                        </div>


                        <div style={styles.buttonGroup}>
                            <button type="submit" style={styles.btnPrimary}>
                                {editando ? 'Guardar Cambios' : 'Crear Receptor'}
                            </button>
                            {editando && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={styles.btnSecondary}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>


                {/* TABLA DE RECEPTORES */}
                <div style={{ ...styles.card, flex: 2 }}>
                    <h2 style={styles.subtitle}>Lista de Receptores</h2>


                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID Cliente</th>
                                <th style={styles.th}>RFC</th>
                                <th style={styles.th}>Razón Social</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>F. Creación</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {receptores.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={styles.emptyText}>
                                        No hay receptores registrados.
                                    </td>
                                </tr>
                            ) : (
                                receptores.map((item) => (
                                    <tr key={item.cliente_id} style={styles.tr}>
                                        <td style={styles.td}>{item.cliente_id}</td>
                                        <td style={styles.td}>{item.rfc}</td>
                                        <td style={styles.td}>{item.razon_social}</td>
                                        <td style={styles.td}>{item.email}</td>
                                        <td style={styles.td}>{item.fecha_creacion}</td>
                                        <td style={styles.td}>
                        <span
                            style={{
                                ...styles.badge,
                                backgroundColor: item.activo ? '#dcfce7' : '#fee2e2',
                                color: item.activo ? '#15803d' : '#b91c1c',
                            }}
                        >
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                style={styles.btnEdit}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.cliente_id)}
                                                style={styles.btnDelete}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}


// Estilos sencillos en línea
const styles = {
    container: {
        padding: '2rem',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: '1.5rem',
    },
    subtitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '1rem',
    },
    content: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        flex: '1 1 350px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    checkbox: {
        width: '16px',
        height: '16px',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '0.875rem',
        color: '#334155',
        cursor: 'pointer',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#475569',
        marginBottom: '0.25rem',
    },
    input: {
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '0.875rem',
        outline: 'none',
    },
    buttonGroup: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    btnPrimary: {
        flex: 1,
        padding: '0.625rem',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    btnSecondary: {
        padding: '0.625rem 1rem',
        backgroundColor: '#94a3b8',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.875rem',
    },
    tableHeader: {
        backgroundColor: '#f1f5f9',
    },
    th: {
        padding: '0.75rem',
        color: '#475569',
        fontWeight: '600',
        borderBottom: '1px solid #e2e8f0',
    },
    tr: {
        borderBottom: '1px solid #f1f5f9',
    },
    td: {
        padding: '0.75rem',
        color: '#334155',
    },
    badge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    btnEdit: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#eab308',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginRight: '0.5rem',
    },
    btnDelete: {
        padding: '0.25rem 0.5rem',
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    emptyText: {
        textAlign: 'center',
        padding: '1.5rem',
        color: '#94a3b8',
    },
};