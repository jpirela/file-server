# Files Server - Servidor de Archivos Express.js

Un servidor de archivos robusto construido con **Express.js 5** y **Multer** para la subida, almacenamiento y servicio de archivos con soporte para subcarpetas dinámicas.

## 🚀 Características

- ✅ Subida de archivos con validación de tipos
- ✅ Soporte para subcarpetas dinámicas
- ✅ Servicio de archivos estáticos
- ✅ Listado recursivo de archivos
- ✅ Configuración mediante variables de entorno
- ✅ Límite de tamaño configurable (5MB por defecto)
- ✅ Uso de ES Modules (módulos ECMAScript)
- ✅ Interfaz web simple incluida

## 📋 Requisitos

- **Node.js** v16 o superior
- **npm** o **yarn**

## 🛠️ Instalación

1. **Clona el repositorio:**
```bash
git clone <url-del-repositorio>
cd files-server
```

2. **Instala las dependencias:**
```bash
npm install
```
o
```bash
yarn install
```

3. **Configura las variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto (puedes usar el ejemplo incluido):
```env
PORT=3031
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx
UPLOAD_DIRECTORY=uploads
```

4. **Inicia el servidor:**
```bash
# Producción
npm start

# Desarrollo (con nodemon)
npm run dev
```

El servidor estará disponible en `http://localhost:3031`

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3000` |
| `UPLOAD_DIRECTORY` | Directorio para archivos subidos | `uploads` |
| `ALLOWED_EXTENSIONS` | Extensiones permitidas (separadas por coma) | *(ninguna)* |

### Ejemplo de archivo `.env`:
```env
PORT=3031
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx,txt,zip
UPLOAD_DIRECTORY=uploads
```

## 📁 Estructura del Proyecto

```
files-server/
├── .env                    # Variables de entorno
├── .gitignore             # Archivos ignorados por Git
├── server.js              # Servidor principal (ES Modules)
├── app.js                 # Versión alternativa (CommonJS)
├── package.json           # Dependencias y scripts
├── uploads/               # Directorio de archivos subidos (creado automáticamente)
└── README.md             # Este archivo
```

## 🔧 Arquitectura y Funcionamiento

### Tecnologías Utilizadas

- **Express.js 5**: Framework web minimalista para Node.js
- **Multer 2.0**: Middleware para manejo de datos multipart/form-data
- **dotenv**: Manejo de variables de entorno
- **ES Modules**: Uso de importaciones modernas de JavaScript

### Componentes Principales

#### 1. **Configuración de Multer**
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = req.body.subfolder || '';
    const uploadPath = path.join(UPLOAD_DIR, subfolder);
    // Crear subcarpetas dinámicamente
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
```

#### 2. **Validación de Archivos**
- Filtro por extensiones permitidas configurables
- Límite de tamaño de archivo (5MB por defecto)
- Nombres únicos con timestamp para evitar colisiones

#### 3. **Gestión de Subcarpetas**
- Creación automática de subcarpetas basada en el campo `subfolder`
- Listado recursivo de todos los archivos en todas las subcarpetas

## 🚀 API Endpoints

### `GET /`
**Descripción:** Página principal con información del servidor
**Respuesta:** HTML con información básica

### `POST /upload`
**Descripción:** Sube un archivo al servidor

**Parámetros:**
- `file` (multipart): Archivo a subir
- `subfolder` (opcional): Nombre de la subcarpeta donde guardar el archivo

**Ejemplo con curl:**
```bash
# Subir archivo a la raíz
curl -X POST -F "file=@mi-archivo.jpg" http://localhost:3031/upload

# Subir archivo a una subcarpeta
curl -X POST -F "file=@mi-archivo.jpg" -F "subfolder=imagenes" http://localhost:3031/upload
```

**Respuesta exitosa:**
```
Archivo subido con éxito: file-1693485234567-123456789.jpg
```

### `GET /files/:path`
**Descripción:** Sirve archivos estáticos desde el directorio de uploads

**Ejemplos:**
```
GET /files/mi-archivo.jpg              # Archivo en la raíz
GET /files/imagenes/foto.png           # Archivo en subcarpeta
GET /files/docs/subfolder/documento.pdf # Archivo en subcarpeta anidada
```

### `GET /list-files`
**Descripción:** Lista todos los archivos disponibles de forma recursiva

**Respuesta:**
```json
[
  "archivo1.jpg",
  "imagenes/foto.png",
  "docs/documento.pdf",
  "docs/subfolder/archivo-anidado.txt"
]
```

## 📝 Ejemplos de Uso

### Subir archivo con HTML
```html
<!DOCTYPE html>
<html>
<body>
  <form action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file" required>
    <input type="text" name="subfolder" placeholder="Subcarpeta (opcional)">
    <button type="submit">Subir archivo</button>
  </form>
</body>
</html>
```

### Subir archivo con JavaScript (Fetch API)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('subfolder', 'mi-carpeta');

fetch('/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.text())
.then(data => console.log(data));
```

### Listar archivos con JavaScript
```javascript
fetch('/list-files')
  .then(response => response.json())
  .then(files => {
    console.log('Archivos disponibles:', files);
    files.forEach(file => {
      console.log(`Acceso: http://localhost:3031/files/${file}`);
    });
  });
```

## 🐛 Manejo de Errores

- **400**: No se subió ningún archivo o tipo no permitido
- **404**: Archivo no encontrado
- **500**: Error del servidor (problemas de permisos, disco lleno, etc.)

## 🔒 Seguridad

- Validación de tipos de archivo mediante extensiones
- Nombres de archivo únicos para evitar sobrescritura
- Límite de tamaño de archivo configurable
- Filtrado de extensiones peligrosas

## 🚦 Scripts Disponibles

```bash
npm start      # Inicia el servidor en producción
npm run dev    # Inicia el servidor en modo desarrollo con nodemon
npm test       # Ejecuta las pruebas (no implementado)
```

## 📦 Dependencias

### Producción
- `express: ^5.1.0` - Framework web
- `multer: ^2.0.2` - Manejo de archivos multipart
- `dotenv: ^17.2.1` - Variables de entorno

### Desarrollo
- `nodemon: ^3.1.10` - Recarga automática en desarrollo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🔧 Notas de Desarrollo

- El proyecto usa **ES Modules** (`"type": "module"` en package.json)
- Existe una versión alternativa en `app.js` que usa CommonJS (para compatibilidad con Phusion Passenger)
- Los archivos subidos se almacenan en la carpeta `uploads/` que se crea automáticamente
- El servidor maneja la creación recursiva de subcarpetas según sea necesario

## ❓ Solución de Problemas

### Puerto ocupado
Si el puerto 3031 está ocupado, cambia la variable `PORT` en el archivo `.env`

### Permisos de escritura
Asegúrate de que Node.js tenga permisos de escritura en el directorio del proyecto

### Archivos no se suben
Verifica que la extensión del archivo esté en la lista `ALLOWED_EXTENSIONS`

---

**¿Necesitas ayuda?** Abre un issue en el repositorio del proyecto.
