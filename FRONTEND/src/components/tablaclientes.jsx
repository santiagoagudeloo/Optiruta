import React, { useState } from 'react';

const TablaClientes = ({ clientes, onSeleccionChange }) => {
  const [seleccionados, setSeleccionados] = useState({});
  const [filtro, setFiltro] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroCiudadOrigen, setFiltroCiudadOrigen] = useState('');
  const [filtroCiudadDestino, setFiltroCiudadDestino] = useState('');

  const handleSelectAll = (e) => {
    const nuevos = {};
    clientesFiltrados.forEach(c => {
      nuevos[c.ID] = e.target.checked;
    });
    setSeleccionados(nuevos);
    const seleccionadosList = clientesFiltrados.filter(c => nuevos[c.ID]);
    onSeleccionChange(seleccionadosList);
  };

  const handleSelect = (id, cliente) => {
    const nuevos = { ...seleccionados, [id]: !seleccionados[id] };
    setSeleccionados(nuevos);
    const seleccionadosList = clientesFiltrados.filter(c => nuevos[c.ID]);
    onSeleccionChange(seleccionadosList);
  };

  // Obtener ciudades únicas para los filtros
  const ciudadesOrigen = [...new Set(clientes.map(c => c.Ciudad_Origen))];
  const ciudadesDestino = [...new Set(clientes.map(c => c.Ciudad_Destino))];
  const prioridades = ['URGENTE', 'ALTA', 'MEDIA', 'BAJA'];

  const clientesFiltrados = clientes.filter(c => {
    if (filtro && !c.Nombre_Cliente.toLowerCase().includes(filtro.toLowerCase()) 
        && !c.Ciudad_Destino.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }
    if (filtroPrioridad && c.Prioridad !== filtroPrioridad) {
      return false;
    }
    if (filtroCiudadOrigen && c.Ciudad_Origen !== filtroCiudadOrigen) {
      return false;
    }
    if (filtroCiudadDestino && c.Ciudad_Destino !== filtroCiudadDestino) {
      return false;
    }
    return true;
  });

  // Obtener lista de clientes seleccionados
  const clientesSeleccionados = clientesFiltrados.filter(c => seleccionados[c.ID]);

  return (
    <div>
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border rounded p-2"
        />
        
        <select
          value={filtroCiudadOrigen}
          onChange={(e) => setFiltroCiudadOrigen(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Todas las ciudades origen</option>
          {ciudadesOrigen.map(ciudad => (
            <option key={ciudad} value={ciudad}>{ciudad}</option>
          ))}
        </select>

        <select
          value={filtroCiudadDestino}
          onChange={(e) => setFiltroCiudadDestino(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Todas las ciudades destino</option>
          {ciudadesDestino.map(ciudad => (
            <option key={ciudad} value={ciudad}>{ciudad}</option>
          ))}
        </select>

        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">⭐ Todas las prioridades</option>
          {prioridades.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Resumen selección (sin distancia aproximada) */}
        <div className="bg-blue-50 rounded p-2 text-center flex items-center justify-center">
          <span className="font-bold"> {clientesSeleccionados.length}</span>
          <span className="text-gray-600 ml-1">seleccionados</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 w-10">
                <input type="checkbox" onChange={handleSelectAll} />
              </th>
              <th className="border p-2">ID</th>
              <th className="border p-2">Cliente</th>
              <th className="border p-2">Ciudad Origen</th>
              <th className="border p-2">Ciudad Destino</th>
              <th className="border p-2">Peso (kg)</th>
              <th className="border p-2">Volumen (m³)</th>
              <th className="border p-2">⭐ Prioridad</th>
              <th className="border p-2">🚚 Tipo</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(cliente => (
              <tr 
                key={cliente.ID} 
                className={`hover:bg-gray-50 ${
                  cliente.Ciudad_Destino === 'Bogotá' ? 'bg-green-50' : ''
                }`}
              >
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={seleccionados[cliente.ID] || false}
                    onChange={() => handleSelect(cliente.ID, cliente)}
                  />
                </td>
                <td className="border p-2">{cliente.ID}</td>
                <td className="border p-2">{cliente.Nombre_Cliente}</td>
                <td className="border p-2">
                  <span className="px-2 py-1 bg-blue-100 rounded text-xs">
                    {cliente.Ciudad_Origen}
                  </span>
                </td>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    cliente.Ciudad_Destino === 'Bogotá'
                      ? 'bg-green-100 text-green-700 font-bold'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {cliente.Ciudad_Destino}
                    {cliente.Ciudad_Destino === 'Bogotá' && ' 🏍️'}
                  </span>
                </td>
                <td className="border p-2">{cliente.Peso_kg}</td>
                <td className="border p-2">{cliente.Volumen_m3}</td>
                <td className={`border p-2 font-bold ${
                  cliente.Prioridad === 'URGENTE' ? 'text-red-600' :
                  cliente.Prioridad === 'ALTA' ? 'text-orange-600' :
                  cliente.Prioridad === 'MEDIA' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {cliente.Prioridad}
                </td>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    cliente.Ciudad_Destino === 'Bogotá'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {cliente.Ciudad_Destino === 'Bogotá' ? '🏍️ Moto' : '🚚 Inter'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {clientesFiltrados.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No hay paquetes que coincidan con los filtros
        </div>
      )}
    </div>
  );
};

export default TablaClientes;