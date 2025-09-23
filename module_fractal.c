#include "art_core.h"
#include <stdlib.h>
#include <time.h>

typedef struct {
    float zoom;
    float offsetX;
    float offsetY;
    int iterations;
    float animationTime;
    Color palette[256];
    float speed;
} FractalState;

static FractalState fractal;
static AnimationSettings animation = { 0.15f, 0.0f, false, 1.0f };

static int CalculateMandelbrot(float x, float y, int maxIterations) {
    float real = x;
    float imag = y;
    float r2 = 0, i2 = 0;
    
    for (int i = 0; i < maxIterations; i++) {
        if (r2 + i2 > 4.0f) return i;
        
        float newReal = r2 - i2 + real;
        float newImag = 2.0f * sqrtf(r2) * sqrtf(i2) + imag;
        
        r2 = newReal * newReal;
        i2 = newImag * newImag;
    }
    
    return maxIterations;
}

static int CalculateJulia(float x, float y, float cReal, float cImag, int maxIterations) {
    float real = x;
    float imag = y;
    
    for (int i = 0; i < maxIterations; i++) {
        float r2 = real * real;
        float i2 = imag * imag;
        
        if (r2 + i2 > 4.0f) return i;
        
        float newReal = r2 - i2 + cReal;
        float newImag = 2.0f * real * imag + cImag;
        
        real = newReal;
        imag = newImag;
    }
    
    return maxIterations;
}

static void GeneratePalette(Color* palette, float hueShift) {
    for (int i = 0; i < 256; i++) {
        float t = (float)i / 255.0f;
        float hue = fmodf(t * 360.0f + hueShift, 360.0f);
        
        // HSV to RGB conversion
        float c = 1.0f;
        float x = c * (1 - fabsf(fmodf(hue / 60.0f, 2) - 1));
        float m = 0.2f;
        
        float r, g, b;
        if (hue < 60) { r = c; g = x; b = 0; }
        else if (hue < 120) { r = x; g = c; b = 0; }
        else if (hue < 180) { r = 0; g = c; b = x; }
        else if (hue < 240) { r = 0; g = x; b = c; }
        else if (hue < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        palette[i] = (Color){
            (unsigned char)((r + m) * 255),
            (unsigned char)((g + m) * 255),
            (unsigned char)((b + m) * 255),
            255
        };
    }
}

static void Fractal_Init(void) {
    fractal.zoom = 1.0f;
    fractal.offsetX = -0.5f;
    fractal.offsetY = 0.0f;
    fractal.iterations = 100 + (rand() % 156);  // Random iterations 100-255
    fractal.animationTime = 0.0f;
    fractal.speed = 0.1f + (rand() % 30) * 0.01f;  // Random speed 0.1-0.4
    
    // Start with a random hue offset for variety
    float randomHue = (float)(rand() % 360);
    GeneratePalette(fractal.palette, randomHue);
}

static void Fractal_Update(float deltaTime) {
    if (!animation.paused) {
        fractal.animationTime += deltaTime * fractal.speed;
        fractal.zoom = 1.0f + sinf(fractal.animationTime) * 0.3f * animation.smoothness;
        
        // Slowly rotate the palette for color animation
        GeneratePalette(fractal.palette, fractal.animationTime * 20.0f);
    }
}

static void Fractal_Draw(void) {
    // Background
    DrawRectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, BLACK);
    
    float scale = 3.0f / (fractal.zoom * fminf(SCREEN_WIDTH, SCREEN_HEIGHT));
    int detail = IsKeyDown(KEY_H) ? 1 : 3; // Hold H for high detail
    
    // Draw fractal
    for (int x = 0; x < SCREEN_WIDTH; x += detail) {
        for (int y = 0; y < SCREEN_HEIGHT; y += detail) {
            float real = (x - SCREEN_WIDTH / 2.0f) * scale + fractal.offsetX;
            float imag = (y - SCREEN_HEIGHT / 2.0f) * scale + fractal.offsetY;
            
            int iterations;
            if (IsKeyDown(KEY_J)) {
                // Julia set
                float cReal = -0.7f + sinf(fractal.animationTime * 0.5f) * 0.1f;
                float cImag = 0.27f + cosf(fractal.animationTime * 0.3f) * 0.1f;
                iterations = CalculateJulia(real, imag, cReal, cImag, fractal.iterations);
            } else {
                // Mandelbrot set
                iterations = CalculateMandelbrot(real, imag, fractal.iterations);
            }
            
            if (iterations < fractal.iterations) {
                Color color = fractal.palette[iterations % 256];
                float fade = 1.0f - (float)iterations / fractal.iterations;
                DrawRectangle(x, y, detail, detail, Fade(color, 0.8f + fade * 0.2f));
            }
        }
    }
}

static void Fractal_HandleInput(void) {
    if (IsKeyPressed(KEY_UP)) {
        fractal.speed = fminf(fractal.speed + 0.05f, 1.0f);
    }
    if (IsKeyPressed(KEY_DOWN)) {
        fractal.speed = fmaxf(fractal.speed - 0.05f, 0.05f);
    }
    if (IsKeyPressed(KEY_P)) {
        animation.paused = !animation.paused;
    }
    if (IsKeyPressed(KEY_R)) {
        Fractal_Init();
    }
    
    // Manual navigation
    float moveSpeed = 0.1f * (3.0f / fractal.zoom);
    if (IsKeyDown(KEY_W)) fractal.offsetY -= moveSpeed;
    if (IsKeyDown(KEY_S)) fractal.offsetY += moveSpeed;
    if (IsKeyDown(KEY_A)) fractal.offsetX -= moveSpeed;
    if (IsKeyDown(KEY_D)) fractal.offsetX += moveSpeed;
    
    // Zoom control
    if (IsKeyDown(KEY_Q)) fractal.zoom *= 1.05f;
    if (IsKeyDown(KEY_E)) fractal.zoom *= 0.95f;
}

static void Fractal_Cleanup(void) {
    // Cleanup if needed
}

static ArtModule fractalModule = {
    .name = "Fractal",
    .init = Fractal_Init,
    .update = Fractal_Update,
    .draw = Fractal_Draw,
    .cleanup = Fractal_Cleanup,
    .handleInput = Fractal_HandleInput
};

ArtModule* GetFractalModule(void) {
    return &fractalModule;
}