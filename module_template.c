// Template for creating new art modules
// Copy this file and rename it to module_yourname.c
// Then modify the functions and register it in main.c

#include "art_core.h"

typedef struct {
    // Add your module-specific state variables here
    float exampleValue;
    Color exampleColor;
    float animationTime;
} YourModuleState;

static YourModuleState moduleState;
static Particle particles[MAX_PARTICLES]; // Optional: use particle system
static AnimationSettings animation = { 0.3f, 0.0f, false, 1.0f };

static void YourModule_Init(void) {
    // Initialize your module state
    moduleState.exampleValue = 0.0f;
    moduleState.exampleColor = RAYWHITE;
    moduleState.animationTime = 0.0f;
    
    // Optional: Initialize particles
    InitParticleSystem(particles, MAX_PARTICLES);
}

static void YourModule_Update(float deltaTime) {
    if (!animation.paused) {
        moduleState.animationTime += deltaTime * animation.speed;
        
        // Update your module logic here
        // Example: Animate something
        moduleState.exampleValue = sinf(moduleState.animationTime) * 100.0f;
        
        // Optional: Update particles
        UpdateParticleSystem(particles, MAX_PARTICLES, deltaTime);
    }
}

static void YourModule_Draw(void) {
    // Draw your art here
    
    // Example: Draw a background
    DrawRectangleGradientV(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 
                           BLACK, DARKGRAY);
    
    // Example: Draw something animated
    DrawCircle(SCREEN_WIDTH/2 + moduleState.exampleValue, 
               SCREEN_HEIGHT/2, 
               50, 
               moduleState.exampleColor);
    
    // Optional: Draw particles
    DrawParticleSystem(particles, MAX_PARTICLES, 0.5f);
}

static void YourModule_HandleInput(void) {
    // Handle module-specific input
    if (IsKeyPressed(KEY_R)) {
        YourModule_Init(); // Reset
    }
    
    if (IsKeyPressed(KEY_P)) {
        animation.paused = !animation.paused;
    }
    
    // Add more controls as needed
    if (IsKeyPressed(KEY_UP)) {
        animation.speed = fminf(animation.speed + 0.1f, 2.0f);
    }
    if (IsKeyPressed(KEY_DOWN)) {
        animation.speed = fmaxf(animation.speed - 0.1f, 0.1f);
    }
}

static void YourModule_Cleanup(void) {
    // Clean up any resources if needed
}

// Module definition
static ArtModule yourModule = {
    .name = "Your Module Name",
    .init = YourModule_Init,
    .update = YourModule_Update,
    .draw = YourModule_Draw,
    .cleanup = YourModule_Cleanup,
    .handleInput = YourModule_HandleInput
};

// Export function to get the module
ArtModule* GetYourModule(void) {
    return &yourModule;
}