const express = require('express');
const { optimizarRuta, obtenerClientes } = require('../controllers/optimizacion.controller');

const router = express.Router();

// POST /api/optimizar/:vehiculo
router.post('/optimizar/:vehiculo', optimizarRuta);

// GET /api/clientes
router.get('/clientes', obtenerClientes);

module.exports = router;