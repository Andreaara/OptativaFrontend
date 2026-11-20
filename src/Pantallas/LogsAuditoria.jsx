import React, { useState, useEffect } from 'react';
import { apiFetch } from '../Utils/api.js';
import '../Estilos/Estilos.css';

export default function LogsAuditoria() {
    const [logs, setLogs] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [errorApi, setErrorApi] = useState(null);

    const cargarLogs = async () => {
        setCargando(true);
        setErrorApi(null);
        try {
            const data = await apiFetch('/auditoria');
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorApi(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarLogs();
    }, []);

    return (
        <div className="pantalla-principal-container">
            <div className="pantalla-header">
                <div className="pantalla-titulo">
                    <span className="titulo-icono">
                        <span className="material-symbols-outlined">policy</span>
                    </span>
                    <div>
                        <h2>Bitácora de Auditoría (DynamoDB)</h2>
                        <p>
                            {logs.length}{' '}
                            {logs.length === 1 ? 'evento registrado' : 'eventos registrados'} (Solo lectura)
                        </p>
                    </div>
                </div>
                <button type="button" className="btn-primario" onClick={cargarLogs}>
                    Actualizar Logs
                </button>
            </div>

            {errorApi && (
                <div className="alerta-error" role="alert">
                    <span className="material-symbols-outlined">error</span> {errorApi}
                </div>
            )}

            {cargando && (
                <div className="cargando-texto">
                    <span className="spinner" /> Consultando Logs_auditoria en DynamoDB...
                </div>
            )}

            {!cargando && (
                <div className="tabla-contenedor">
                    <table className="tabla-servicios">
                        <thead>
                        <tr>
                            <th>Fecha / Hora (UTC)</th>
                            <th>Entidad ID</th>
                            <th>Usuario ID</th>
                            <th>Acción</th>
                            <th>Detalles JSON</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <div className="tabla-vacia">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <span>No hay eventos de auditoría registrados</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, idx) => (
                                <tr key={`${log.entidad_id}-${log.timestamp_utc}-${idx}`} className="fila-servicio">
                                    <td>{new Date(log.timestamp_utc).toLocaleString()}</td>
                                    <td>
                                        <span className="texto-id">{log.entidad_id}</span>
                                    </td>
                                    <td>
                                        <span className="texto-id">{log.usuario_id}</span>
                                    </td>
                                    <td>
                                        <span className="chip-categoria">{log.accion}</span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                        {log.detalles_json}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}