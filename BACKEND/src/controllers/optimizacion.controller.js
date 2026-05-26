const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ALGORITMOS_PATH = path.join(__dirname, '../algoritmos');

const scriptMap = {
  'moto': path.join(ALGORITMOS_PATH, 'moto/moto.py'),
  'camion': path.join(ALGORITMOS_PATH, 'camion/camion.py'),
  'mula': path.join(ALGORITMOS_PATH, 'mula/mula_velocidad.py')
};

// Obtener clientes
const obtenerClientes = (req, res) => {
  try {
    const datasetPath = path.join(__dirname, '../../dataset/clientes.json');
    
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ error: 'No se encontró clientes.json' });
    }
    
    const clientes = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar clientes' });
  }
};

// Optimizar ruta
const optimizarRuta = (req, res) => {
  const { vehiculo } = req.params;
  const { clientes } = req.body;
  
  const script = scriptMap[vehiculo?.toLowerCase()];
  
  if (!script || !clientes?.length) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  
  if (!fs.existsSync(script)) {
    return res.status(500).json({ error: `No se encontró algoritmo para ${vehiculo}` });
  }
  
  const tempFile = path.join(__dirname, `../temp_${Date.now()}.json`);
  
  fs.writeFileSync(tempFile, JSON.stringify(clientes));
  
  const python = spawn('python', [script, tempFile]);
  
  let output = '';
  
  python.stdout.on('data', (data) => { output += data; });
  python.stderr.on('data', (data) => { console.error(data.toString()); });
  
  python.on('close', (code) => {
    fs.unlinkSync(tempFile);
    
    if (code !== 0) {
      return res.status(500).json({ error: `Error en ${vehiculo}` });
    }
    
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      res.json(JSON.parse(jsonMatch[0]));
    } catch {
      res.status(500).json({ error: 'Error al procesar resultado' });
    }
  });
};

module.exports = { obtenerClientes, optimizarRuta };