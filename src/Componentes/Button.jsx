import '../Estilos/Estilos.css'; 

// Botón de Agregar
export function AddButton({ onClick, children = "Agregar" }) {
  return (
    <button className="button-agregar" onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}

// Botón de Eliminar
export function DeleteButton({ onClick }) {
  return (
    <button className="delete-btn" onClick={onClick} aria-label="Eliminar">
      
    </button>
  );
}

// Botón de Editar
export function EditButton({ onClick }) {
  return (
    <button className="edit-btn" onClick={onClick} aria-label="Editar">
      
    </button>
  );
}