# SIDEGER-CC

sideger-cc (sistema de Gestión de Recursos y Clúster Computacional) es una herramienta que permite desplegar
y gestionar un clúster basado en HTCondor sobre una infraestructura física con recursos de cómputo heterogeneos,
asimismo permite la ejecución de tareas computacionales intensivas, TODO DESDE UNA INTERFAZ GRÁFICA (GUI).

## Requerimientos y tecnologías
* Infraestructura de cómputo con **mínimo 3 recursos físicos**
* Los recursos físicos deben tener instalado el sistema operativo **Linux Mint**
* Los recursos físicos deben compartir **un mismo usuario y contraseña**
* Los recursos físicos deben tener instalo y activo un servidor **openssh-server**
* Los recursos físicos deben tener instalado **Docker** (y Docker Swarm desactivado)
* **Compilador de Rust** (rustc) instalado en el recurso desde el cual se usa sideger-cc
* **Python3** y **venv** instalado en el recurso desde el cual se usa sideger-cc
* **arp-scan** instalado en el recurso desde el cual se usa sideger-cc
* **claves ssh** listas en el recurso desde el cual se usa sideger-cc
* **tauri-cli 2.4.1** instalado en el recurso desde el cual se usa sideger-cc
* **cargo 1.86.0** instalado en el recurso desde el cual se usa sideger-cc

## Preparativos previos
La herramienta se encarga de las instalaciones necesarias para arrancar el sistema de manera simple. Para empezar clone este repositorio.

Antes de lanzar la herramienta, por favor cree un archivo **.env** en el directorio raiz del proyecto y adjunte los respectivos valores para las llaves indicadas en el siguiente ejemplo (conserve el nombre de las llaves).

```bash
SSH_KEY="/path/to/ssh/private-key"
VITE_API_URL="http://localhost:8000"
```

## Lanzar sideger-cc
 abra una terminal y ubiquese en el directorio raíz del proyecto, finalmente ejecute:

```bash
npm install
```

y luego:

```bash
npm run tauri dev
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)