import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Mapa = ({ ruta, distanciaTotal }) => {  // ← Agregar distanciaTotal como prop
  if (!ruta || ruta.length === 0) {
    return <div className="text-center p-4">No hay ruta para mostrar</div>;
  }

  // Obtener coordenadas para centrar el mapa
  const centro = ruta.length > 0 
    ? [ruta[0].latitud, ruta[0].longitud]
    : [4.6097, -74.0817];

  // Crear líneas entre puntos
  const lineas = [];
  for (let i = 0; i < ruta.length - 1; i++) {
    lineas.push([
      [ruta[i].latitud, ruta[i].longitud],
      [ruta[i + 1].latitud, ruta[i + 1].longitud]
    ]);
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* ========================================== */}
      {/* RECUADRO DE DISTANCIA SOBRE EL MAPA */}
      {/* ========================================== */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
         Distancia total: <span style={{ color: '#2563eb' }}>{distanciaTotal.toFixed(1)} km</span>
      </div>

      <MapContainer 
        center={centro} 
        zoom={6} 
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marcadores */}
        {ruta.map((punto, idx) => (
          <Marker 
            key={idx} 
            position={[punto.latitud, punto.longitud]}
          >
            <Popup>
              <div className="text-sm">
                <strong>{punto.nombre}</strong><br />
                 {punto.ciudad}<br />
                 {punto.peso} kg<br />
                 {punto.volumen} m³<br />
                 {punto.prioridad}<br />
                <span className="text-blue-600">Orden: {punto.orden}</span>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Líneas de ruta */}
        {lineas.map((linea, idx) => (
          <Polyline
            key={idx}
            positions={linea}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default Mapa;