import React, { useState } from 'react';


export default function Emisor() {
    // Estado para la lista de emisores (sin estados iniciales)
    const [emisores, setEmisores] = useState([]);


    // Estado del formulario
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


    // Manejar el cambio en los inputs del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };


    // Resetear el formulario
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
    };


    // Crear o Actualizar Emisor
    const handleSubmit = (e) => {
        e.preventDefault();


        if (editando) {
            setEmisores(
                emisores.map((item) =>
                    item.emisor_id === formData.emisor_id ? { ...formData } : item
                )
            );
        } else {
            const nuevoEmisor = {
                ...formData,
                emisor_id: Date.now(), // Simulación de ID
            };
            setEmisores([...emisores, nuevoEmisor]);
        }


        resetForm();
    };


    // Cargar para editar
    const handleEdit = (emisor) => {
        setFormData(emisor);
        setEditando(true);
    };


    // Eliminar emisor
    const handleDelete = (emisor_id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este emisor?')) {
            setEmisores(emisores.filter((item) => item.emisor_id !== emisor_id));
            if (formData.emisor_id === emisor_id) {
                resetForm();
            }
        }
    };


    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Gestión de Emisores</h1>


            <div style={styles.content}>
                {/* FORMULARIO */}
                <div style={styles.card}>
                    <h2 style={styles.subtitle}>
                        {editando ? 'Editar Emisor' : 'Crear Nuevo Emisor'}
                    </h2>


                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>ID Usuario (FK)</label>
                            <input
                                type="number"
                                name="usuario_id"
                                value={formData.usuario_id}
                                onChange={handleChange}
                                placeholder="ID del usuario asociado"
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.row}>
                            <div style={{ ...styles.inputGroup, flex: 1 }}>
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


                            <div style={{ ...styles.inputGroup, flex: 1, marginLeft: '10px' }}>
                                <label style={styles.label}>Régimen Fiscal</label>
                                <input
                                    type="text"
                                    name="regimen_fiscal"
                                    value={formData.regimen_fiscal}
                                    onChange={handleChange}
                                    placeholder="Ej. 601 - General de Ley"
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Razón Social</label>
                            <input
                                type="text"
                                name="razon_social"
                                value={formData.razon_social}
                                onChange={handleChange}
                                placeholder="Nombre o empresa"
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
                                placeholder="contacto@emisor.com"
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
                                Emisor Activo
                            </label>
                        </div>


                        <div style={styles.buttonGroup}>
                            <button type="submit" style={styles.btnPrimary}>
                                {editando ? 'Guardar Cambios' : 'Crear Emisor'}
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


                {/* TABLA DE EMISORES */}
                <div style={{ ...styles.card, flex: 2 }}>
                    <h2 style={styles.subtitle}>Lista de Emisores</h2>


                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Usuario ID</th>
                                <th style={styles.th}>RFC</th>
                                <th style={styles.th}>Razón Social</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {emisores.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={styles.emptyText}>
                                        No hay emisores registrados.
                                    </td>
                                </tr>
                            ) : (
                                emisores.map((item) => (
                                    <tr key={item.emisor_id} style={styles.tr}>
                                        <td style={styles.td}>{item.emisor_id}</td>
                                        <td style={styles.td}>{item.usuario_id}</td>
                                        <td style={styles.td}>{item.rfc}</td>
                                        <td style={styles.td}>{item.razon_social}</td>
                                        <td style={styles.td}>{item.email}</td>
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
                                                onClick={() => handleDelete(item.emisor_id)}
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
    row: {
        display: 'flex',
        justifyContent: 'space-between',
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