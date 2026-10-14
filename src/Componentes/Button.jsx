import React from 'react';
import '../Estilos/Estilos.css'; 

// Botón de Agregar
export function AddButton({ onClick, children = "Agregar", type = "button" }) {
  return (
    <button type={type} className="button-agregar" onClick={onClick}>
      <span className="material-symbols-outlined">add</span>
      <span>{children}</span>
    </button>
  );
}

// Botón de Eliminar
export function DeleteButton({ onClick }) {
  return (
    <button type="button" className="delete-btn btn-accion" onClick={onClick} aria-label="Eliminar" title="Eliminar">
      <span className="material-symbols-outlined">delete</span>
    </button>
  );
}

// Botón de Editar
export function EditButton({ onClick }) {
  return (
    <button type="button" className="edit-btn btn-accion" onClick={onClick} aria-label="Editar" title="Editar">
      <span className="material-symbols-outlined">edit</span>
    </button>
  );
}