#define NOB_IMPLEMENTATION
#include "nob.h"
#include <string.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

int command_exists(const char *cmd) {
    char path[1024];
    snprintf(path, sizeof(path), "which %s > /dev/null 2>&1", cmd);
    return system(path) == 0;
}

void build_raylib_wasm(void) {
    Nob_Cmd cmd = {0};
    
    if (!command_exists("emcc")) {
        nob_log(NOB_ERROR, "emcc not found! Make sure you're in nix develop environment or have emscripten installed");
        nob_log(NOB_INFO, "Run: nix develop");
        exit(1);
    }
    
    const char *raylib_sources[] = {
        "raylib/src/rcore.c", "raylib/src/rshapes.c", "raylib/src/rtextures.c",
        "raylib/src/rtext.c", "raylib/src/rmodels.c", "raylib/src/utils.c", "raylib/src/raudio.c"
    };
    
    nob_log(NOB_INFO, "Building Raylib for WebAssembly...");
    
    for (size_t i = 0; i < NOB_ARRAY_LEN(raylib_sources); i++) {
        if (!nob_file_exists(raylib_sources[i])) {
            nob_log(NOB_ERROR, "Raylib source %s not found!", raylib_sources[i]);
            exit(1);
        }
        
        char obj_name[256];
        const char *basename = strrchr(raylib_sources[i], '/');
        if (basename) basename++; else basename = raylib_sources[i];
        snprintf(obj_name, sizeof(obj_name), "%s.o", basename);
        
        if (nob_needs_rebuild1(obj_name, raylib_sources[i])) {
            cmd.count = 0;
            nob_cmd_append(&cmd, "emcc", "-c", raylib_sources[i], NULL);
            nob_cmd_append(&cmd, "-Os", "-DPLATFORM_WEB", "-DGRAPHICS_API_OPENGL_ES2", NULL);
            nob_cmd_append(&cmd, "-I", "raylib/src", NULL);
            nob_cmd_append(&cmd, "-o", obj_name, NULL);
            
            if (!nob_cmd_run_sync(cmd)) {
                nob_log(NOB_ERROR, "Failed to compile %s", raylib_sources[i]);
                nob_log(NOB_INFO, "Make sure you're in nix develop environment");
                exit(1);
            }
        }
    }
    
    if (nob_needs_rebuild("libraylib.a", NULL, 0)) {
        cmd.count = 0;
        nob_cmd_append(&cmd, "emar", "rcs", "libraylib.a", NULL);
        nob_cmd_append(&cmd, "rcore.c.o", "rshapes.c.o", "rtextures.c.o", NULL);
        nob_cmd_append(&cmd, "rtext.c.o", "rmodels.c.o", "utils.c.o", "raudio.c.o", NULL);
        
        if (!nob_cmd_run_sync(cmd)) {
            nob_log(NOB_ERROR, "Failed to create libraylib.a");
            exit(1);
        }
    }
}

void build_art_wasm(void) {
    Nob_Cmd cmd = {0};
    
    if (!nob_file_exists("libraylib.a")) {
        build_raylib_wasm();
    }
    
    nob_log(NOB_INFO, "Building Art Generator for WebAssembly...");
    
    cmd.count = 0;
    nob_cmd_append(&cmd, "emcc", "art_wasm.c", "libraylib.a", NULL);
    nob_cmd_append(&cmd, "-o", "art.html", NULL);
    nob_cmd_append(&cmd, "-Os", "-Wall", NULL);
    nob_cmd_append(&cmd, "-I", "raylib/src", NULL);
    nob_cmd_append(&cmd, "-s", "USE_GLFW=3", NULL);
    nob_cmd_append(&cmd, "-s", "ASYNCIFY", NULL);
    nob_cmd_append(&cmd, "-s", "TOTAL_MEMORY=67108864", NULL);
    nob_cmd_append(&cmd, "-s", "FORCE_FILESYSTEM=1", NULL);
    nob_cmd_append(&cmd, "-DPLATFORM_WEB", NULL);
    
    if (nob_file_exists("shell.html")) {
        nob_cmd_append(&cmd, "--shell-file", "shell.html", NULL);
    }
    
    if (!nob_cmd_run_sync(cmd)) {
        nob_log(NOB_ERROR, "Failed to build Art WASM");
        exit(1);
    }
    
    nob_log(NOB_INFO, "Art WASM built successfully!");
    nob_log(NOB_INFO, "Run './nob serve' to start the web server");
}

void build_native(void) {
    Nob_Cmd cmd = {0};
    
    const char *raylib_sources[] = {
        "raylib/src/rcore.c", "raylib/src/rshapes.c", "raylib/src/rtextures.c",
        "raylib/src/rtext.c", "raylib/src/rmodels.c", "raylib/src/utils.c", "raylib/src/raudio.c"
    };
    
    nob_log(NOB_INFO, "Building native version...");
    
    for (size_t i = 0; i < NOB_ARRAY_LEN(raylib_sources); i++) {
        static char obj_name[256];
        const char *basename = strrchr(raylib_sources[i], '/');
        if (basename) basename++; else basename = raylib_sources[i];
        snprintf(obj_name, sizeof(obj_name), "%s_native.o", basename);
        
        if (nob_needs_rebuild1(obj_name, raylib_sources[i])) {
            cmd.count = 0;
            nob_cmd_append(&cmd, "cc", "-c", raylib_sources[i], NULL);
            nob_cmd_append(&cmd, "-O2", "-DPLATFORM_DESKTOP", NULL);
            nob_cmd_append(&cmd, "-I", "raylib/src", NULL);
            nob_cmd_append(&cmd, "-o", obj_name, NULL);
            
            if (!nob_cmd_run_sync(cmd)) {
                nob_log(NOB_ERROR, "Failed to compile %s", raylib_sources[i]);
                exit(1);
            }
        }
    }
    
    cmd.count = 0;
    nob_cmd_append(&cmd, "cc", "art_wasm.c", NULL);
    nob_cmd_append(&cmd, "rcore.c_native.o", "rshapes.c_native.o", "rtextures.c_native.o", NULL);
    nob_cmd_append(&cmd, "rtext.c_native.o", "rmodels.c_native.o", "utils.c_native.o", "raudio.c_native.o", NULL);
    nob_cmd_append(&cmd, "-o", "art_native", NULL);
    nob_cmd_append(&cmd, "-O2", "-I", "raylib/src", NULL);
    nob_cmd_append(&cmd, "-lm", "-lpthread", NULL);
    
    #ifdef __linux__
        nob_cmd_append(&cmd, "-ldl", "-lGL", "-lX11", NULL);
    #elif defined(__APPLE__)
        nob_cmd_append(&cmd, "-framework", "OpenGL", NULL);
        nob_cmd_append(&cmd, "-framework", "Cocoa", NULL);
        nob_cmd_append(&cmd, "-framework", "IOKit", NULL);
        nob_cmd_append(&cmd, "-framework", "CoreVideo", NULL);
    #endif
    
    if (!nob_cmd_run_sync(cmd)) {
        nob_log(NOB_ERROR, "Failed to build native executable");
        exit(1);
    }
    
    nob_log(NOB_INFO, "Native build completed!");
}

void build_server(void) {
    Nob_Cmd cmd = {0};
    
    if (nob_needs_rebuild1("server", "server.c")) {
        nob_log(NOB_INFO, "Building web server...");
        cmd.count = 0;
        nob_cmd_append(&cmd, "cc", "server.c", "-o", "server", NULL);
        nob_cmd_append(&cmd, "-O2", "-Wall", NULL);
        
        if (!nob_cmd_run_sync(cmd)) {
            nob_log(NOB_ERROR, "Failed to build server");
            exit(1);
        }
    }
}

void run_server(void) {
    Nob_Cmd cmd = {0};
    nob_log(NOB_INFO, "Starting web server on http://localhost:8080");
    nob_cmd_append(&cmd, "./server", NULL);
    nob_cmd_run_sync(cmd);
}

void run_native(void) {
    Nob_Cmd cmd = {0};
    if (!nob_file_exists("art_native")) {
        build_native();
    }
    nob_cmd_append(&cmd, "./art_native", NULL);
    nob_cmd_run_sync(cmd);
}

void build_modular_native(void) {
    Nob_Cmd cmd = {0};
    
    nob_log(NOB_INFO, "Building modular art generator (native)...");
    
    const char *sources[] = {
        "main.c", "art_core.c", "module_mandala.c", "module_fractal.c"
    };
    
    const char *objects[] = {
        "main.o", "art_core.o", "module_mandala.o", "module_fractal.o"
    };
    
    for (size_t i = 0; i < NOB_ARRAY_LEN(sources); i++) {
        if (!nob_file_exists(sources[i])) {
            nob_log(NOB_ERROR, "Source file %s not found!", sources[i]);
            exit(1);
        }
        
        if (nob_needs_rebuild1(objects[i], sources[i])) {
            cmd.count = 0;
            nob_cmd_append(&cmd, "gcc", "-Wall", "-Wextra", "-O2", "-std=c11", NULL);
            nob_cmd_append(&cmd, "-c", sources[i], "-o", objects[i], NULL);
            
            if (!nob_cmd_run_sync(cmd)) {
                nob_log(NOB_ERROR, "Failed to compile %s", sources[i]);
                exit(1);
            }
        }
    }
    
    cmd.count = 0;
    nob_cmd_append(&cmd, "gcc", NULL);
    for (size_t i = 0; i < NOB_ARRAY_LEN(objects); i++) {
        nob_cmd_append(&cmd, objects[i], NULL);
    }
    nob_cmd_append(&cmd, "-o", "art_generator", NULL);
    nob_cmd_append(&cmd, "-lraylib", "-lm", "-lpthread", "-ldl", "-lrt", "-lX11", NULL);
    
    #ifdef __linux__
        nob_cmd_append(&cmd, "-lGL", NULL);
    #elif defined(__APPLE__)
        nob_cmd_append(&cmd, "-framework", "CoreVideo", NULL);
        nob_cmd_append(&cmd, "-framework", "IOKit", NULL);
        nob_cmd_append(&cmd, "-framework", "Cocoa", NULL);
        nob_cmd_append(&cmd, "-framework", "GLUT", NULL);
        nob_cmd_append(&cmd, "-framework", "OpenGL", NULL);
    #endif
    
    if (!nob_cmd_run_sync(cmd)) {
        nob_log(NOB_ERROR, "Failed to link art_generator");
        exit(1);
    }
    
    nob_log(NOB_INFO, "Modular art generator built successfully!");
}

void build_fractal_wasm(void) {
    Nob_Cmd cmd = {0};
    
    if (!command_exists("emcc")) {
        nob_log(NOB_ERROR, "emcc not found! Make sure you're in nix develop environment");
        exit(1);
    }
    
    if (!nob_file_exists("libraylib.a")) {
        build_raylib_wasm();
    }
    
    nob_log(NOB_INFO, "Building Fractal module for WASM...");
    
    cmd.count = 0;
    nob_cmd_append(&cmd, "emcc", "module_fractal.c", "libraylib.a", NULL);
    nob_cmd_append(&cmd, "-o", "fractals.html", NULL);
    nob_cmd_append(&cmd, "-Os", "-Wall", NULL);
    nob_cmd_append(&cmd, "-I", "raylib/src", NULL);
    nob_cmd_append(&cmd, "-s", "USE_GLFW=3", NULL);
    nob_cmd_append(&cmd, "-s", "ASYNCIFY", NULL);
    nob_cmd_append(&cmd, "-s", "TOTAL_MEMORY=67108864", NULL);
    nob_cmd_append(&cmd, "-DPLATFORM_WEB", NULL);
    
    if (nob_file_exists("shell.html")) {
        nob_cmd_append(&cmd, "--shell-file", "shell.html", NULL);
    }
    
    if (!nob_cmd_run_sync(cmd)) {
        nob_log(NOB_ERROR, "Failed to build Fractal WASM");
        exit(1);
    }
    
    nob_log(NOB_INFO, "Fractal WASM built successfully!");
}

void build_mandala_wasm(void) {
    Nob_Cmd cmd = {0};
    
    if (!command_exists("emcc")) {
        nob_log(NOB_ERROR, "emcc not found! Make sure you're in nix develop environment");
        exit(1);
    }
    
    if (!nob_file_exists("libraylib.a")) {
        build_raylib_wasm();
    }
    
    nob_log(NOB_INFO, "Building Mandala module for WASM...");
    
    cmd.count = 0;
    nob_cmd_append(&cmd, "emcc", "module_mandala.c", "libraylib.a", NULL);
    nob_cmd_append(&cmd, "-o", "mandala.html", NULL);
    nob_cmd_append(&cmd, "-Os", "-Wall", NULL);
    nob_cmd_append(&cmd, "-I", "raylib/src", NULL);
    nob_cmd_append(&cmd, "-s", "USE_GLFW=3", NULL);
    nob_cmd_append(&cmd, "-s", "ASYNCIFY", NULL);
    nob_cmd_append(&cmd, "-s", "TOTAL_MEMORY=67108864", NULL);
    nob_cmd_append(&cmd, "-DPLATFORM_WEB", NULL);
    
    if (nob_file_exists("shell.html")) {
        nob_cmd_append(&cmd, "--shell-file", "shell.html", NULL);
    }
    
    if (!nob_cmd_run_sync(cmd)) {
        nob_log(NOB_ERROR, "Failed to build Mandala WASM");
        exit(1);
    }
    
    nob_log(NOB_INFO, "Mandala WASM built successfully!");
}

void clean(void) {
    const char *patterns[] = {
        "*.o", "*.a", "art.html", "art.js", "art.wasm", "art.data",
        "fractals.html", "fractals.js", "fractals.wasm", "fractals.data",
        "mandala.html", "mandala.js", "mandala.wasm", "mandala.data",
        "art_native", "art_generator", "server", "nob.old"
    };
    
    nob_log(NOB_INFO, "Cleaning build artifacts...");
    
    Nob_Cmd cmd = {0};
    for (size_t i = 0; i < NOB_ARRAY_LEN(patterns); i++) {
        cmd.count = 0;
        nob_cmd_append(&cmd, "rm", "-f", patterns[i], NULL);
        nob_cmd_run_sync(cmd);
    }
    
    nob_log(NOB_INFO, "Clean completed");
}

int main(int argc, char **argv) {
    NOB_GO_REBUILD_URSELF(argc, argv);
    
    const char *program = nob_shift_args(&argc, &argv);
    
    if (argc == 0) {
        nob_log(NOB_INFO, "Usage: %s <command> [options]", program);
        nob_log(NOB_INFO, "Commands:");
        nob_log(NOB_INFO, "  wasm         - Build Art WebAssembly version");
        nob_log(NOB_INFO, "  fractal-wasm - Build Fractal module for WASM");
        nob_log(NOB_INFO, "  mandala-wasm - Build Mandala module for WASM");
        nob_log(NOB_INFO, "  all-wasm     - Build all WASM modules");
        nob_log(NOB_INFO, "  native       - Build native executable (art_wasm.c)");
        nob_log(NOB_INFO, "  modular      - Build modular art generator (main.c + modules)");
        nob_log(NOB_INFO, "  serve        - Build and start web server for WASM");
        nob_log(NOB_INFO, "  run          - Run native version");
        nob_log(NOB_INFO, "  clean        - Remove all build artifacts");
        nob_log(NOB_INFO, "  all          - Build everything");
        return 0;
    }
    
    const char *command = nob_shift_args(&argc, &argv);
    
    if (strcmp(command, "wasm") == 0) {
        build_art_wasm();
    } else if (strcmp(command, "fractal-wasm") == 0) {
        build_fractal_wasm();
    } else if (strcmp(command, "mandala-wasm") == 0) {
        build_mandala_wasm();
    } else if (strcmp(command, "all-wasm") == 0) {
        build_art_wasm();
        build_fractal_wasm();
        build_mandala_wasm();
        nob_log(NOB_INFO, "All WASM modules built!");
    } else if (strcmp(command, "native") == 0) {
        build_native();
    } else if (strcmp(command, "modular") == 0) {
        build_modular_native();
    } else if (strcmp(command, "serve") == 0) {
        build_server();
        run_server();
    } else if (strcmp(command, "run") == 0) {
        run_native();
    } else if (strcmp(command, "clean") == 0) {
        clean();
    } else if (strcmp(command, "all") == 0) {
        build_art_wasm();
        build_fractal_wasm();
        build_mandala_wasm();
        build_native();
        build_modular_native();
        build_server();
        nob_log(NOB_INFO, "All builds completed!");
    } else {
        nob_log(NOB_ERROR, "Unknown command: %s", command);
        return 1;
    }
    
    return 0;
}