
import '../Buttons/AddButton.css';

// Boton de agregar

export function AddButton({ onClick }) {
    return (
        <button className="button-agregar" onClick={onClick}>

            <span>Agregar</span>
        </button>
    )
}

//Boton de eliminar
export default function DeleteButton({ onClick }) {
    return (
        <button className="delete-btn" onClick={onClick} aria-label="Eliminar">
           
        </button>
    );
}

//Boton de editar
export default function EditButton({ onClick }) {
    return (
        <button className="edit-btn" onClick={onClick} aria-label="Editar">
        </button>
    );
}