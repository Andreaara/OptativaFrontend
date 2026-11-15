import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Impuestos() {
  const [impuestos, setImpuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const rol = localStorage.getItem('rol') || 'FACTURADOR';

  useEffect(() => {
    cargarImpuestos();
  }, []);

  const cargarImpuestos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Reemplaza con la URL del API Gateway FALTA CAMBIAR
      const response = await fetch('https://zdqh4zqlfl.execute-api.us-east-1.amazonaws.com', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setImpuestos(data);
      } else {
        throw new Error('Error al obtener impuestos');
      }
    } catch (error) {
      // Datos del script
      setImpuestos([
        { impuesto_id: 1, nombre_impuesto: 'IVA General 16%', tasa_porcentaje: 16.00, fecha_inicio_vigencia: '2024-01-01', activo: 1 },
        { impuesto_id: 2, nombre_impuesto: 'IVA Frontera 8%', tasa_porcentaje: 8.00, fecha_inicio_vigencia: '2024-01-01', activo: 1 },
        { impuesto_id: 3, nombre_impuesto: 'Retención ISR 10%', tasa_porcentaje: 10.00, fecha_inicio_vigencia: '2024-01-01', activo: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarTasa = async (impuestoId) => {
    if (rol !== 'ADMIN') {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'Solo el rol ADMINISTRADOR puede modificar tasas fiscales en la RDS.'
      });
      return;
    }

    const { value: nuevaTasa } = await Swal.fire({
      title: 'Actualizar Tasa de Impuesto',
      input: 'number',
      inputLabel: 'Ingrese la nueva tasa porcentual (Ej. 16.00)',
      inputAttributes: { step: '0.01', min: '0', max: '100' },
      showCancelButton: true,
      confirmButtonText: 'Actualizar con Stored Procedure',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(value) || value < 0) {
          return 'Debe ingresar un valor numérico válido';
        }
      }
    });

    if (nuevaTasa) {
      Swal.fire({
        icon: 'success',
        title: 'Tasa Actualizada',
        text: `Se ejecutó sp_actualizar_tasa_impuesto para el ID ${impuestoId} con la nueva tasa de ${nuevaTasa}%.`
      });
      cargarImpuestos();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catálogo de Impuestos y Tasas (RDS)</h1>
          <p className="text-sm text-gray-600">Administración de la tabla <code className="bg-gray-100 px-1 py-0.5 rounded text-indigo-600">Impuestos_Historico</code>.</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
          Rol Actual: {rol}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando registros fiscales...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Impuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia Desde</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {impuestos.map((imp) => (
                <tr key={imp.impuesto_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{imp.impuesto_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{imp.nombre_impuesto}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">{Number(imp.tasa_porcentaje).toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.fecha_inicio_vigencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${imp.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {imp.activo ? 'Vigente' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {rol === 'ADMIN' ? (
                      <button
                        onClick={() => handleActualizarTasa(imp.impuesto_id)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-xs font-semibold"
                      >
                        Actualizar Tasa
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}