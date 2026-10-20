import React, { useState } from 'react';


export default function Pagos() {
    // Estado para la lista de pagos (sin estado inicial)
    const [pagos, setPagos] = useState([]);


    // Estado para el formulario de pago
    const [formData, setFormData] = useState({
        pago_id: null,
        factura_id: '',
        monto: '',
        tipo_tarjeta: '',
        fecha_pago: '',
    });


    const [editando, setEditando] = useState(false);


    // Manejar el cambio de datos en los campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    // Limpiar el formulario
    const resetForm = () => {
        setFormData({
            pago_id: null,
            factura_id: '',
            monto: '',
            tipo_tarjeta: '',
            fecha_pago: '',
        });
        setEditando(false);
    };


    // Crear o Editar Pago
    const handleSubmit = (e) => {
        e.preventDefault();


        if (editando) {
            setPagos(
                pagos.map((item) =>
                    item.pago_id === formData.pago_id ? { ...formData } : item
                )
            );
        } else {
            const nuevoPago = {
                ...formData,
                pago_id: Date.now(), // Simulación de ID
            };
            setPagos([...pagos, nuevoPago]);
        }


        resetForm();
    };


    // Cargar registro para editar
    const handleEdit = (pago) => {
        setFormData(pago);
        setEditando(true);
    };


    // Eliminar registro de pago
    const handleDelete = (pago_id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
            setPagos(pagos.filter((item) => item.pago_id !== pago_id));
            if (formData.pago_id === pago_id) {
                resetForm();
            }
        }
    };


    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Gestión de Pagos</h1>


            <div style={styles.content}>
                {/* FORMULARIO */}
                <div style={styles.card}>
                    <h2 style={styles.subtitle}>
                        {editando ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                    </h2>


                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>ID Factura (FK)</label>
                            <input
                                type="number"
                                name="factura_id"
                                value={formData.factura_id}
                                onChange={handleChange}
                                placeholder="ID de la factura vinculada"
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Monto ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="monto"
                                value={formData.monto}
                                onChange={handleChange}
                                placeholder="0.00"
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Tipo de Tarjeta</label>
                            <select
                                name="tipo_tarjeta"
                                value={formData.tipo_tarjeta}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            >
                                <option value="">Seleccionar tipo...</option>
                                <option value="Crédito">Crédito</option>
                                <option value="Débito">Débito</option>
                                <option value="Prepago">Prepago</option>
                                <option value="Corporativa">Corporativa</option>
                            </select>
                        </div>


                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Fecha de Pago</label>
                            <input
                                type="datetime-local"
                                name="fecha_pago"
                                value={formData.fecha_pago}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>


                        <div style={styles.buttonGroup}>
                            <button type="submit" style={styles.btnPrimary}>
                                {editando ? 'Guardar Cambios' : 'Registrar Pago'}
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


                {/* TABLA DE PAGOS */}
                <div style={{ ...styles.card, flex: 2 }}>
                    <h2 style={styles.subtitle}>Historial de Pagos</h2>


                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID Pago</th>
                                <th style={styles.th}>ID Factura</th>
                                <th style={styles.th}>Monto</th>
                                <th style={styles.th}>Tipo de Tarjeta</th>
                                <th style={styles.th}>Fecha de Pago</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pagos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={styles.emptyText}>
                                        No hay pagos registrados.
                                    </td>
                                </tr>
                            ) : (
                                pagos.map((item) => (
                                    <tr key={item.pago_id} style={styles.tr}>
                                        <td style={styles.td}>{item.pago_id}</td>
                                        <td style={styles.td}>{item.factura_id}</td>
                                        <td style={styles.td}>
                                            ${parseFloat(item.monto).toFixed(2)}
                                        </td>
                                        <td style={styles.td}>{item.tipo_tarjeta}</td>
                                        <td style={styles.td}>
                                            {new Date(item.fecha_pago).toLocaleString()}
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                style={styles.btnEdit}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.pago_id)}
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