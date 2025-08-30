require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIRECTORY || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || '').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);

  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Endpoint para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo o el tipo de archivo no está permitido.');
  }
  res.send('Archivo subido con éxito.');
});

// Endpoint para listar archivos subidos
app.get('/files', (req, res) => {
  const uploadDir = process.env.UPLOAD_DIRECTORY || 'uploads/';

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error al leer el directorio de archivos.');
    }
    res.json(files);
  });
});

// Endpoint para acceder a archivos específicos
app.get('/files/:filename(*)', (req, res) => {
  const filepath = path.join(__dirname, process.env.UPLOAD_DIRECTORY || 'uploads', req.params.filename);
  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).send('Archivo no encontrado');
    }
  });
});

// Para Phusion Passenger: no usar app.listen
module.exports = app;
