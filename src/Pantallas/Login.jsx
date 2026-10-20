import React, { useState } from 'react';
import Input from "../Componentes/Input.jsx";
import '../Estilos/Estilos.css';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errores, setErrores] = useState({});
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errorLogin, setErrorLogin] = useState('');

    // Validaciones inmediatas por campo
    const validarCampo = (name, value) => {
        let error = '';

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value.trim()) {
                error = 'El correo electrónico es obligatorio';
            } else if (!emailRegex.test(value)) {
                error = 'Ingresa un correo electrónico válido';
            }
        }

        if (name === 'password') {
            if (!value) {
                error = 'La contraseña es obligatoria';
            } else if (value.length < 6) {
                error = 'La contraseña debe tener al menos 6 caracteres';
            }
        }

        setErrores((prev) => ({ ...prev, [name]: error ? { message: error } : null }));
        return !error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            validarCampo(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validarCampo(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorLogin('');

        // Validar todo antes de enviar
        const emailValido = validarCampo('email', formData.email);
        const passValido = validarCampo('password', formData.password);

        if (!emailValido || !passValido) return;

        setCargando(true);

        try {
            // Simulación de petición de autenticación
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log('Datos de inicio de sesión:', formData);
            alert('¡Inicio de sesión exitoso!');
        } catch (err) {
            setErrorLogin('Credenciales incorrectas. Revisa tu correo y contraseña.');
        } finally {
            setCargando(false);
        }
    };


    return (
        <div className="pantalla-principal-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="modal-contenido" style={{ maxWidth: '420px', width: '100%', padding: '32px' }}>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#2563eb' }}>
            lock
          </span>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 4px' }}>
                        Iniciar Sesión
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        Ingresa a tu cuenta para gestionar los servicios
                    </p>
                </div>

                {errorLogin && (
                    <div className="alerta-error" role="alert" style={{ marginBottom: '16px' }}>
                        <span className="material-symbols-outlined">error</span>
                        <span>{errorLogin}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errores.email}
                        disabled={cargando}
                        autoComplete="email"
                        required
                    />

                    <div style={{ position: 'relative', width: '100%' }}>
                        <Input
                            label="Contraseña"
                            type={mostrarPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errores.password}
                            disabled={cargando}
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: errores.password ? '32px' : '38px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
              <span className="material-symbols-outlined">
                {mostrarPassword ? 'visibility_off' : 'visibility'}
              </span>
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn-primario"
                        disabled={cargando}
                        style={{
                            marginTop: '8px',
                            padding: '12px',
                            justifyContent: 'center',
                            width: '100%',
                            fontSize: '16px'
                        }}
                    >
                        {cargando ? (
                            <>
                                <span className="spinner" style={{ width: '16px', height: '16px' }} />
                                Iniciando sesión...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}