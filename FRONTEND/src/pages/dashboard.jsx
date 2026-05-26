import React, { useState, useEffect } from 'react';
import Mapa from '../components/Mapa';
import TablaClientes from '../components/TablaClientes';
import Resultados from '../components/Resultados';
import { optimizarRuta, cargarClientes } from '../api/vehiculos';
import BacktrackingVisualizer from '../components/BacktrackingVisualizer';

const Dashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [vehiculo, setVehiculo] = useState('Moto');
  const [seleccionados, setSeleccionados] = useState([]);
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Cargar clientes desde el backend
    cargarClientes().then(data => setClientes(data));
  }, []);

  const handleOptimizar = async () => {
    if (seleccionados.length === 0) {
      alert('Selecciona al menos un paquete');
      return;
    }

    setCargando(true);
    try {
      const resultado = await optimizarRuta(vehiculo, seleccionados);
      setResultados(resultado);
    } catch (error) {
      alert('Error al optimizar la ruta');
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">📦 OPTIRUTA +, Gestión de Paquetes - Optimización de Rutas</h1>
      </header>

      <main className="container mx-auto p-4">
        {/* Selector de vehículo */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex gap-4 items-center">
            <label className="font-bold">Seleccionar Vehículo:</label>
            <select 
              value={vehiculo} 
              onChange={(e) => setVehiculo(e.target.value)}
              className="border rounded p-2"
            >
              <option value="Moto">🛵 Moto (20kg, 0.5m³)</option>
              <option value="Camion">🚚 Camión (150kg, 5m³)</option>
              <option value="Mula">🚛 Mula (500kg, 15m³)</option>
            </select>
            
            <button 
              onClick={handleOptimizar}
              disabled={cargando}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {cargando ? 'Optimizando...' : '🎯 Optimizar Ruta'}
            </button>
          </div>
        </div>

        {/* Tabla de clientes */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-xl font-bold mb-4">📋 Paquetes Disponibles</h2>
          <TablaClientes 
            clientes={clientes} 
            onSeleccionChange={setSeleccionados}
          />
        </div>

        {/* Resultados */}
        {resultados && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <Resultados resultados={resultados} />
          </div>
        )}

        {/* Backtracking Visualizer */}
        {resultados && resultados.backtracking_info && (
          <BacktrackingVisualizer info={resultados.backtracking_info} />
        )}

        {/* Mapa */}
        {resultados && resultados.ruta && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">🗺️ Ruta Optimizada</h2>
            {/* ========================================== */}
            {/* PASAR distanciaTotal AL MAPA */}
            {/* ========================================== */}
            <Mapa 
              ruta={resultados.ruta} 
              distanciaTotal={resultados.distancia_total}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;