import { alertaCamposVacios, alertaCamposCaracteres, alertaError } from './Alerts.js';

export const limpiarTexto = (valor) => {
    if (typeof valor !== 'string') return '';
    return valor.trim().replace(/\s{2,}/g, ' ');
};

const esTextoBasura = (texto) => {
    const limpio = limpiarTexto(texto);
    if (!limpio) return true;

    // 1. Misma letra repetida 5 o más veces seguidas (ej. "aaaaaa")
    if (/(.)\1{4,}/i.test(limpio)) return true;

    // 2. Palabras de más de 14 letras seguidas sin espacios (ej. "akdwjudheufhukwgwe...")
    const palabras = limpio.split(' ');
    for (const p of palabras) {
        if (p.length > 18) return true;
        // Palabra de >= 6 letras sin ninguna vocal (ej. "fvfbg", "bcdfghj")
        if (p.length >= 6 && !/[aeiouáéíóúü]/i.test(p)) return true;
    }

    return false;
};

export const validarTexto = (valor, nombreCampo, { min = 2, max = 120, soloLetras = false } = {}) => {
    const limpio = limpiarTexto(valor);

    if (!limpio) {
        alertaCamposVacios();
        return null;
    }

    if (limpio.length < min || limpio.length > max) {
        alertaError(`El campo "${nombreCampo}" debe tener entre ${min} y ${max} caracteres.`);
        return null;
    }

    const regexPermitido = soloLetras
        ? /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
        : /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-_#()&/]+$/;

    if (!regexPermitido.test(limpio)) {
        alertaCamposCaracteres(`El campo "${nombreCampo}" contiene caracteres no permitidos.`);
        return null;
    }

    if (esTextoBasura(limpio)) {
        alertaError(`El texto ingresado en "${nombreCampo}" no parece válido.`);
        return null;
    }

    return limpio;
};

export const validarEnteroPositivo = (valor, nombreCampo) => {
    const num = Number(valor);
    if (!valor || !Number.isInteger(num) || num <= 0) {
        alertaError(`El campo "${nombreCampo}" debe ser un número entero mayor a 0.`);
        return null;
    }
    return num;
};

export const validarMontoPositivo = (valor, nombreCampo) => {
    const num = parseFloat(valor);
    if (valor === '' || isNaN(num) || num <= 0) {
        alertaError(`El campo "${nombreCampo}" debe ser un monto mayor a $0.00.`);
        return null;
    }
    return Number(num.toFixed(2));
};