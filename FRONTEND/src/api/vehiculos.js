import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const optimizarRuta = async (vehiculo, clientesSeleccionados) => {
  try {
    const response = await axios.post(`${API_URL}/optimizar/${vehiculo}`, {
      clientes: clientesSeleccionados
    });
    return response.data;
  } catch (error) {
    console.error('Error al optimizar:', error);
    throw error;
  }
};

export const cargarClientes = async () => {
  try {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
    throw error;
  }
};