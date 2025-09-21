#include "art_core.h"
#include <stdio.h>
#include <time.h>

// External module getters
extern ArtModule* GetMandalaModule(void);
extern ArtModule* GetFractalModule(void);

// Add your new modules here
// extern ArtModule* GetNewArtModule(void);

int main(void) {
    // Initialize window
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Modular Art Generator - Nise da Silveira Homage");
    SetTargetFPS(60);
    
    // Initialize random seed
    srand(time(NULL));
    
    // Register all modules
    RegisterModule(GetMandalaModule());
    RegisterModule(GetFractalModule());
    // Register new modules here:
    // RegisterModule(GetNewArtModule());
    
    // Initialize first module
    ArtModule* currentModule = GetCurrentModule();
    if (currentModule && currentModule->init) {
        currentModule->init();
    }
    
    // Main loop
    while (!WindowShouldClose()) {
        float deltaTime = GetFrameTime();
        
        // Handle module switching
        if (IsKeyPressed(KEY_TAB)) {
            // Cleanup current module
            if (currentModule && currentModule->cleanup) {
                currentModule->cleanup();
            }
            
            // Switch to next module
            NextModule();
            currentModule = GetCurrentModule();
            
            // Initialize new module
            if (currentModule && currentModule->init) {
                currentModule->init();
            }
        }
        
        if (IsKeyPressed(KEY_LEFT_SHIFT) && IsKeyPressed(KEY_TAB)) {
            // Cleanup current module
            if (currentModule && currentModule->cleanup) {
                currentModule->cleanup();
            }
            
            // Switch to previous module
            PreviousModule();
            currentModule = GetCurrentModule();
            
            // Initialize new module
            if (currentModule && currentModule->init) {
                currentModule->init();
            }
        }
        
        // Update current module
        if (currentModule) {
            if (currentModule->handleInput) {
                currentModule->handleInput();
            }
            
            if (currentModule->update) {
                currentModule->update(deltaTime);
            }
        }
        
        // Draw
        BeginDrawing();
        ClearBackground(BLACK);
        
        // Draw current module
        if (currentModule && currentModule->draw) {
            currentModule->draw();
        }
        
        // Draw UI overlay
        DrawRectangle(0, 0, SCREEN_WIDTH, 90, Fade(BLACK, 0.7f));
        
        // Module info
        DrawText(TextFormat("Module: %s", currentModule ? currentModule->name : "None"), 
                 10, 10, 24, GREEN);
        
        // Controls
        DrawText("TAB: Next Module | SHIFT+TAB: Previous Module", 10, 40, 16, WHITE);
        DrawText("Module Controls: Arrow Keys, R: Reset, P: Pause", 10, 60, 16, WHITE);
        
        // Show all available modules
        int startX = SCREEN_WIDTH - 200;
        DrawText("Available Modules:", startX, 10, 16, YELLOW);
        for (int i = 0; i < GetModuleCount(); i++) {
            Color color = (i == GetCurrentModule() - GetMandalaModule()) ? GREEN : GRAY;
            DrawText(TextFormat("%d. %s", i + 1, GetModuleName(i)), 
                    startX, 30 + i * 20, 14, color);
        }
        
        // FPS
        DrawText(TextFormat("FPS: %d", GetFPS()), SCREEN_WIDTH - 80, SCREEN_HEIGHT - 30, 20, GREEN);
        
        EndDrawing();
    }
    
    // Cleanup current module
    if (currentModule && currentModule->cleanup) {
        currentModule->cleanup();
    }
    
    CloseWindow();
    return 0;
}