const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173'
}));

// Middlewares de terceros
app.use(require('morgan')('dev'));   
app.use(express.json());        

// Middleware personalizado global
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// RUTA PARA OPTIMIZACIÓN (API principal)
const optimizacionRouter = require('./routes/optimizacion.routes');
app.use('/api', optimizacionRouter);

// Ruta de prueba rápida
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando', timestamp: new Date() });
});


module.exports = app;