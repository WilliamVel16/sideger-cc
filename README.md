# Requerimientos previos
* Se requieren **mínimo 3 recursos físicos**
* Los recursos físicos deben tener instalado el sistema operativo **Linux Mint 21+**
* Los recursos físicos deben compartir **un mismo usuario y contraseña**
* Los recursos físicos deben tener instalado **Docker** (y Docker Swarm inactivo)
* **Python3**, **venv** y **pip** instalados en el recurso desde el cual se usa sideger-cc
* Los recursos físicos deben tener instalado y activo un servidor **openssh-server**
* **arp-scan** instalado en el recurso desde el cual se usa sideger-cc
* **claves ssh pública y privada** creadas en el recurso desde el cual se usa sideger-cc
* **sshpass** instalado en el recurso desde el cual se usa sideger-cc

# Inicio rápido
## Inicializar el backend
```bash
./src-backend/start.sh
```
El script:
- Crea un entorno virtual si no existe, en caso contrario lo activa
- Instala dependencias desde requirements.txt
- Inicia el servidor FastAPI en:
```bash
http://127.0.0.1:8000
```

## Ejecutar el cliente
Dentro del directorio `dist/` del repositorio se encuentran estos dos archivos:
- `sideger_0.1.0_amd64.deb`
- `sideger_0.1.0_amd64.AppImage`

### Opción A - Ejecutar directamente una imagen `.AppImage`
```bash
chmod +x /dist/sideger_0.1.0_amd64.AppImage
./dist/sideger_0.1.0_amd64.AppImage
```

### Opción B - Instalar la aplicación mediante el `.deb`
```bash
sudo dpkg -i sideger_0.1.0_amd64.deb
```
Luego abra sideger desde el menú de aplicaciones de su equipo.
Con una de estas opciones la aplicación ya esta lista para ser usada

# Modo desarrollo
Para construir desde código Debe tener instalado:
- Rust + Cargo
- Node.js + npm
- Tauri CLI
- Python 3.10+

Instalar dependencias del frontend

```bash
npm install
```

Ejecutar Sideger

```bash
npm run tauri dev
```

## Construir instaladores (.deb y .AppImage)
Para tal fin, simplemente se ejecuta:

```bash
npm run tauri build
```
Los archivos se generarán en el directorio:

```bash
src-tauri/target/release/bundle/
```
Mueva los archivos resultantes en los subdirectorios `deb/` y `appimage/` dentro del directorio `dist/` del proyecto

# Sobre la herramienta

Sideger-CC (Sistema de Gestión de Recursos y Clúster Computacional) es una herramienta que permite desplegar
y gestionar un clúster basado en HTCondor sobre una infraestructura física con recursos de cómputo heterogeneos,
asimismo permite la ejecución de tareas computacionales intensivas. Todo se gestiona a través de una interfaz gráfica (GUI)
desde una aplicación de escritorio (Tauri + Rust + React) que funciona como cliente gráfico para administrar:

- Descubrimiento de recursos en una sala de computación  
- Despliegue de clusters HTCondor en Docker Swarm  
- Gestión de trabajos 
- Visualización de cola de trabajos y resultados  
- Control remoto mediante SSH  
- Contenedores HTCondor distribuidos y escalables

El backend está desarrollado en **FastAPI (Python)** y se ejecuta por separado.