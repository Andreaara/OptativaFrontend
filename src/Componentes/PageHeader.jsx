import React from 'react';

export default function PageHeader({ icon, title, subtitle, children }) {
    return (
        <div className="pantalla-header">
            <div className="pantalla-titulo">
                <span className="titulo-icono">
                    <span className="material-symbols-outlined">{icon}</span>
                </span>
                <div>
                    <h2>{title}</h2>
                    {subtitle && <p>{subtitle}</p>}
                </div>
            </div>
            {children && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {children}
                </div>
            )}
        </div>
    );
}