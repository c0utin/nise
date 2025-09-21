// Simple build system for Raylib WASM projects
#define NOB_IMPLEMENTATION
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    const char **items;
    size_t count;
    size_t capacity;
} Cmd;

void cmd_append(Cmd *cmd, const char *item) {
    if (cmd->count >= cmd->capacity) {
        cmd->capacity = cmd->capacity == 0 ? 8 : cmd->capacity * 2;
        cmd->items = realloc(cmd->items, cmd->capacity * sizeof(char*));
    }
    cmd->items[cmd->count++] = item;
}

bool cmd_run(Cmd *cmd) {
    // Build command string
    size_t len = 0;
    for (size_t i = 0; i < cmd->count; i++) {
        len += strlen(cmd->items[i]) + 1;
    }
    
    char *command = malloc(len + 1);
    command[0] = '\0';
    
    for (size_t i = 0; i < cmd->count; i++) {
        strcat(command, cmd->items[i]);
        if (i < cmd->count - 1) strcat(command, " ");
    }
    
    printf("[CMD] %s\n", command);
    int result = system(command);
    free(command);
    
    cmd->count = 0;  // Reset for reuse
    return result == 0;
}

bool build_raylib_wasm() {
    printf("[INFO] Building Raylib for WebAssembly...\n");
    
    Cmd cmd = {0};
    
    // Check if already built
    FILE *f = fopen("raylib/src/libraylib.a", "r");
    if (f) {
        fclose(f);
        printf("[INFO] Raylib already built\n");
        return true;
    }
    
    const char *modules[] = {
        "rcore.c", "rshapes.c", "rtextures.c", 
        "rtext.c", "rmodels.c", "utils.c", "raudio.c"
    };
    
    // Compile each module
    for (int i = 0; i < 7; i++) {
        cmd_append(&cmd, "cd raylib/src && emcc -c");
        cmd_append(&cmd, modules[i]);
        cmd_append(&cmd, "-Os -Wall -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2");
        
        if (!cmd_run(&cmd)) {
            printf("[ERROR] Failed to compile %s\n", modules[i]);
            return false;
        }
    }
    
    // Create library
    cmd_append(&cmd, "cd raylib/src && emar rcs libraylib.a");
    cmd_append(&cmd, "rcore.o rshapes.o rtextures.o rtext.o");
    cmd_append(&cmd, "utils.o rmodels.o raudio.o");
    
    if (!cmd_run(&cmd)) {
        printf("[ERROR] Failed to create libraylib.a\n");
        return false;
    }
    
    printf("[INFO] Raylib built successfully!\n");
    return true;
}

bool build_mandala() {
    printf("[INFO] Building Mandala...\n");
    
    Cmd cmd = {0};
    
    // Create directories
    system("mkdir -p web assets");
    
    // Build mandala
    cmd_append(&cmd, "emcc");
    cmd_append(&cmd, "-o web/mandala.js");
    cmd_append(&cmd, "src/mandala.c");
    cmd_append(&cmd, "-Os -Wall -DPLATFORM_WEB");
    cmd_append(&cmd, "-I. -Iraylib/src -Iraylib/src/external");
    cmd_append(&cmd, "raylib/src/libraylib.a");
    cmd_append(&cmd, "-s USE_GLFW=3");
    cmd_append(&cmd, "-s ASYNCIFY");
    cmd_append(&cmd, "-s TOTAL_MEMORY=67108864");
    cmd_append(&cmd, "-s FORCE_FILESYSTEM=1");
    cmd_append(&cmd, "-s ASSERTIONS=1");
    cmd_append(&cmd, "-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']");
    cmd_append(&cmd, "-s EXPORTED_FUNCTIONS=['_main','_GenerateMandala']");
    cmd_append(&cmd, "-s ALLOW_MEMORY_GROWTH=1");
    
    if (!cmd_run(&cmd)) {
        printf("[ERROR] Failed to build mandala\n");
        return false;
    }
    
    printf("[INFO] Mandala built!\n");
    
    // Build fractals
    printf("[INFO] Building Fractals...\n");
    
    Cmd cmd2 = {0};
    cmd_append(&cmd2, "emcc");
    cmd_append(&cmd2, "-o web/fractals.js");
    cmd_append(&cmd2, "src/fractals.c");
    cmd_append(&cmd2, "-Os -Wall -DPLATFORM_WEB");
    cmd_append(&cmd2, "-I. -Iraylib/src -Iraylib/src/external");
    cmd_append(&cmd2, "raylib/src/libraylib.a");
    cmd_append(&cmd2, "-s USE_GLFW=3");
    cmd_append(&cmd2, "-s ASYNCIFY");
    cmd_append(&cmd2, "-s TOTAL_MEMORY=67108864");
    cmd_append(&cmd2, "-s FORCE_FILESYSTEM=1");
    cmd_append(&cmd2, "-s ASSERTIONS=1");
    cmd_append(&cmd2, "-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']");
    cmd_append(&cmd2, "-s EXPORTED_FUNCTIONS=['_main','_GenerateFractal','_SetFractalType','_SetColorScheme','_ZoomFractal','_PanFractal']");
    cmd_append(&cmd2, "-s ALLOW_MEMORY_GROWTH=1");
    
    if (!cmd_run(&cmd2)) {
        printf("[ERROR] Failed to build fractals\n");
        return false;
    }
    
    printf("[INFO] All builds complete!\n");
    return true;
}

int main(int argc, char **argv) {
    printf("=== Mandala Builder ===\n");
    
    // Check for Emscripten
    if (system("which emcc > /dev/null 2>&1") != 0) {
        printf("[ERROR] Emscripten not found!\n");
        printf("Run this in nix develop shell or install Emscripten\n");
        return 1;
    }
    
    if (argc > 1 && strcmp(argv[1], "clean") == 0) {
        system("rm -rf web/*.js web/*.wasm web/*.data");
        system("rm -rf raylib/src/*.o raylib/src/*.a");
        printf("[INFO] Cleaned build files\n");
        return 0;
    }
    
    if (argc > 1 && strcmp(argv[1], "serve") == 0) {
        printf("[INFO] Starting server at http://localhost:8080\n");
        system("cd web && python3 -m http.server 8080");
        return 0;
    }
    
    // Build process
    if (!build_raylib_wasm()) {
        return 1;
    }
    
    if (!build_mandala()) {
        return 1;
    }
    
    printf("\n[SUCCESS] Build complete!\n");
    printf("Run: ./nob serve\n");
    printf("Open: http://localhost:8080\n");
    
    return 0;
}