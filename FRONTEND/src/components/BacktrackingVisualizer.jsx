import React, { useState } from 'react';

const BacktrackingVisualizer = ({ info }) => {
  const [expandido, setExpandido] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // todos, mejoras, backtracks, podas

  if (!info) return null;

  const { pasos, total_nodos_explorados, total_backtracks, total_mejoras, tiempo_ejecucion_seg, mejores_soluciones } = info;

  const pasosFiltrados = pasos.filter(paso => {
    if (filtro === 'todos') return true;
    if (filtro === 'mejoras') return paso.tipo === 'mejora';
    if (filtro === 'backtracks') return paso.tipo === 'backtrack';
    if (filtro === 'podas') return paso.tipo === 'poda';
    return true;
  });

  const getColorByTipo = (tipo) => {
    switch(tipo) {
      case 'mejora': return 'bg-green-100 border-green-500 text-green-700';
      case 'backtrack': return 'bg-red-100 border-red-500 text-red-700';
      case 'poda': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  const getIconByTipo = (tipo) => {
    switch(tipo) {
      case 'mejora': return '✨';
      case 'backtrack': return '↩️';
      case 'poda': return '✂️';
      default: return '🔍';
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4 bg-gray-50">
      {/* Header */}
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">🌳 Árbol de Backtracking</h3>
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            {tiempo_ejecucion_seg}s
          </span>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-blue-600">📊 Nodos: {total_nodos_explorados}</span>
          <span className="text-red-600">↩️ Backtracks: {total_backtracks}</span>
          <span className="text-green-600">✨ Mejoras: {total_mejoras}</span>
        </div>
        <span>{expandido ? '▼' : '▶'}</span>
      </div>

      {/* Contenido expandido */}
      {expandido && (
        <div className="mt-4">
          {/* Filtros */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setFiltro('todos')}
              className={`px-3 py-1 rounded text-sm ${filtro === 'todos' ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFiltro('mejoras')}
              className={`px-3 py-1 rounded text-sm ${filtro === 'mejoras' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Mejoras
            </button>
            <button 
              onClick={() => setFiltro('backtracks')}
              className={`px-3 py-1 rounded text-sm ${filtro === 'backtracks' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              Backtracks
            </button>
            <button 
              onClick={() => setFiltro('podas')}
              className={`px-3 py-1 rounded text-sm ${filtro === 'podas' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
            >
              Podas
            </button>
          </div>

          {/* Resumen de mejores soluciones */}
          {mejores_soluciones.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-bold text-sm mb-2">Mejores soluciones encontradas:</h4>
              <div className="space-y-1">
                {mejores_soluciones.map((sol, idx) => (
                  <div key={idx} className="text-sm">
                    Nivel {sol.nivel}: Puntaje {sol.puntaje} - Paquetes: {sol.paquetes.join(', ')} 
                    (Peso: {sol.peso}kg, Vol: {sol.volumen}m³)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de pasos */}
          <div className="max-h-96 overflow-y-auto border rounded-lg bg-white">
            <div className="space-y-1 p-2 font-mono text-xs">
              {pasosFiltrados.map((paso, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded border-l-4 ${getColorByTipo(paso.tipo)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold">{getIconByTipo(paso.tipo)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Nivel {paso.nivel}</span>
                        <span className="text-gray-500">Peso: {paso.peso_actual}kg | Vol: {paso.volumen_actual}m³ | Puntaje: {paso.puntaje_actual}</span>
                      </div>
                      
                      {paso.tipo === 'exploracion' && paso.paquetes_seleccionados.length > 0 && (
                        <div className="text-gray-600 mt-1">
                          📦 Paquetes: {paso.paquetes_seleccionados.join(', ')} - {paso.nombres_seleccionados?.join(', ')}
                        </div>
                      )}
                      
                      {paso.tipo === 'backtrack' && paso.info && (
                        <div className="text-red-600 mt-1">
                           Cliente {paso.info.cliente_rechazado} ({paso.info.nombre_rechazado}) no cabe - 
                          {paso.info.razon === 'peso' ? ` Peso excede (${paso.info.peso_intentado}kg > 20kg)` : ` Volumen excede (${paso.info.volumen_intentado}m³ > 60m³)`}
                        </div>
                      )}
                      
                      {paso.tipo === 'mejora' && paso.info && (
                        <div className="text-green-600 mt-1">
                           NUEVA MEJOR SOLUCIÓN! Puntaje: {paso.info.nueva_mejor_puntaje}
                        </div>
                      )}
                      
                      {paso.tipo === 'poda' && paso.info && (
                        <div className="text-yellow-600 mt-1">
                           Poda aplicada: {paso.info.razon} (máximo posible: {paso.info.max_posible})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktrackingVisualizer;