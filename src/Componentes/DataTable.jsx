import React from 'react';

export default function DataTable({ columns, data, emptyMessage = 'No hay registros', renderRow }) {
    return (
        <div className="tabla-contenedor">
            <table className="tabla-servicios">
                <thead>
                <tr>
                    {columns.map((col, idx) => (
                        <th key={idx} className={col.className || ''}>
                            {col.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length}>
                            <div className="tabla-vacia">
                                <span className="material-symbols-outlined">inbox</span>
                                <span>{emptyMessage}</span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    data.map((item, idx) => renderRow(item, idx))
                )}
                </tbody>
            </table>
        </div>
    );
}