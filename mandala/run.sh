#!/usr/bin/env bash

echo "==================================="
echo "  Mandala Generator Build & Run"
echo "==================================="

# Check if in nix shell (has emscripten)
if ! command -v emcc &> /dev/null; then
    echo "[WARNING] Emscripten not found!"
    echo "You need to run: nix develop"
    echo ""
    echo "However, I'll try to run the pre-built version if it exists..."
    
    if [ ! -f "web/mandala.js" ]; then
        echo "[ERROR] No pre-built files found. Please run in nix develop shell."
        exit 1
    fi
else
    echo "[INFO] Building Mandala with Emscripten..."
    
    # Build with the nob builder
    if [ ! -f "nob" ]; then
        echo "[INFO] Compiling build system..."
        gcc nob.c -o nob
    fi
    
    echo "[INFO] Building project..."
    ./nob
    
    if [ $? -ne 0 ]; then
        echo "[ERROR] Build failed!"
        exit 1
    fi
fi

# Compile and run the C server
echo ""
echo "[INFO] Compiling web server..."
gcc server.c -o server

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to compile server!"
    exit 1
fi

echo "[INFO] Starting web server..."
echo ""
./server