#!/bin/bash

VENV_DIR="venv"

if [ ! -d "$VENV_DIR" ]; then
    echo "Entorno virtual no encontrado. Creándolo..."
    python3 -m venv "$VENV_DIR"

    echo "Activando entorno virtual e instalando dependencias..."
    source "$VENV_DIR/bin/activate"
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        echo "Archivo requirements.txt no encontrado."
        exit 1
    fi
else
    echo "Activando entorno virtual existente..."
    source "$VENV_DIR/bin/activate"
fi

# Ejecutar la aplicación
uvicorn main:app --host 127.0.0.1 --port 8000
