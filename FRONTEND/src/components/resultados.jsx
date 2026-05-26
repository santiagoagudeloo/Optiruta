import React from 'react';

const Resultados = ({ resultados }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">✅ Resultados de Optimización</h2>
      
      {/* Cambiar a grid de 6 columnas en desktop */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">🚚 Vehículo</div>
          <div className="text-xl font-bold">{resultados.vehiculo}</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-gray-600">📦 Paquetes</div>
          <div className="text-xl font-bold">{resultados.paquetes_entregados}</div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-sm text-gray-600">⚖️ Peso Total</div>
          <div className="text-xl font-bold">{resultados.peso_total} kg</div>
        </div>
        
        {/* ========================================== */}
        {/* NUEVA TARJETA: VOLUMEN TOTAL */}
        {/* ========================================== */}
        <div className="bg-teal-50 p-3 rounded">
          <div className="text-sm text-gray-600">📐 Volumen Total</div>
          <div className="text-xl font-bold">{resultados.volumen_total} m³</div>
        </div>
        
        <div className="bg-indigo-50 p-3 rounded">
          <div className="text-sm text-gray-600">🛣️ Distancia Total</div>
          <div className="text-xl font-bold">{resultados.distancia_total} km</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-sm text-gray-600">⏱️ Tiempo Estimado</div>
          <div className="text-xl font-bold">{resultados.tiempo_total} h</div>
        </div>
      </div>

      {resultados.ruta && resultados.ruta.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">📋 Orden de Entrega:</h3>
          <div className="bg-gray-50 rounded p-4 max-h-60 overflow-y-auto">
            {resultados.ruta.map((punto, idx) => (
              <div key={idx} className="flex items-center gap-4 py-2 border-b">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {punto.orden}
                </span>
                <span className="font-medium">{punto.nombre}</span>
                <span className="text-gray-500">→ {punto.ciudad}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  punto.prioridad === 'URGENTE' ? 'bg-red-100 text-red-700' :
                  punto.prioridad === 'ALTA' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {punto.prioridad}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resultados;