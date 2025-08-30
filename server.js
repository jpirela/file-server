import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// __dirname para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carpeta uploads base
const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIRECTORY || 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Configuración de Multer con soporte de subcarpetas dinámicas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Leer subcarpeta opcional desde req.body.subfolder
    const subfolder = req.body.subfolder || '';
    const uploadPath = path.join(UPLOAD_DIR, subfolder);

    // Crear la carpeta y subcarpetas si no existen
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Validación de extensiones permitidas desde .env
const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || '')
  .split(',')
  .map(ext => ext.toLowerCase());

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  if (allowedExtensions.includes(ext)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'), false);
};

// Inicializar Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware para servir toda la carpeta UPLOAD_DIR incluyendo subcarpetas
app.use('/files', express.static(UPLOAD_DIR));

// Endpoint para subir archivos
app.post('/upload', express.urlencoded({ extended: true }), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No se subió ningún archivo o tipo no permitido.');
  res.send(`Archivo subido con éxito: ${req.file.filename}`);
});

// Función recursiva para listar archivos
const listFilesRecursively = (dir, basePath = '') => {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    const relativePath = path.join(basePath, item.name);
    if (item.isDirectory()) {
      results = results.concat(listFilesRecursively(itemPath, relativePath));
    } else {
      results.push(relativePath);
    }
  }
  return results;
};

// Endpoint para listar archivos
app.get('/list-files', (req, res) => {
  try {
    const files = listFilesRecursively(UPLOAD_DIR);
    res.json(files);
  } catch (err) {
    res.status(500).send('Error al leer los archivos.');
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send(`<h1>Servidor Express 5 corriendo en puerto ${port}</h1>
            <p>Sube archivos a <strong>/upload</strong> y accede a <strong>/files</strong></p>
            <p>Para subcarpetas, envía un campo <strong>subfolder</strong> en el body del formulario o Postman.</p>`);
});

// Iniciar servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
