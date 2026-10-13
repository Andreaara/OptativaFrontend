import '../Estilos.css'
import { forwardRef } from 'react';

const Input = forwardRef(({ label, type = "text", error, ...props }, ref) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {label && <label className="label">{label}</label>}
            
            <input 
                ref={ref}
                type={type} 
                placeholder={label}
                className="modal-input" 
                
                style={{ borderColor: error ? '#ef4444' : '#d1d5db' }}
                {...props} 
            />

            {error && <span className="error" style={{ color: '#ef4444', fontSize: '12px' }}>{error.message}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
