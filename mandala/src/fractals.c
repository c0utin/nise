#include "raylib.h"
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <emscripten/emscripten.h>

#define SCREEN_WIDTH 800
#define SCREEN_HEIGHT 800
#define MAX_ITERATIONS 256

typedef struct {
    float centerX;
    float centerY;
    float zoom;
    int colorScheme;
    int fractalType;
} FractalState;

FractalState fractal;
RenderTexture2D fractalTexture;
float animTime = 0;

// Julia set parameters
float juliaReal = -0.7;
float juliaImag = 0.27015;

void InitFractal() {
    fractal.centerX = -0.5f;
    fractal.centerY = 0.0f;
    fractal.zoom = 1.5f;
    fractal.colorScheme = rand() % 5;  // Truly random color scheme
    fractal.fractalType = rand() % 4;  // Truly random fractal type
    
    // Randomize Julia parameters with true randomness
    juliaReal = -0.8f + (rand() % 100) * 0.003f;
    juliaImag = 0.156f + (rand() % 100) * 0.003f;
}

Color GetFractalColor(int iterations, int maxIterations) {
    if (iterations == maxIterations) {
        return (Color){0, 0, 0, 255};
    }
    
    float t = (float)iterations / (float)maxIterations;
    float smooth_t = t - logf(logf(iterations + 1)) / logf(2.0f);
    
    switch (fractal.colorScheme) {
        case 0: // Earth tones
            return (Color){
                (unsigned char)(139 + smooth_t * 116),
                (unsigned char)(69 + smooth_t * 100),
                (unsigned char)(19 + smooth_t * 80),
                255
            };
        case 1: // Ocean
            return (Color){
                (unsigned char)(smooth_t * 70),
                (unsigned char)(90 + smooth_t * 130),
                (unsigned char)(140 + smooth_t * 115),
                255
            };
        case 2: // Sunset
            return (Color){
                (unsigned char)(180 + smooth_t * 75),
                (unsigned char)(100 * smooth_t),
                (unsigned char)(60 * (1.0f - smooth_t)),
                255
            };
        case 3: // Forest
            return (Color){
                (unsigned char)(34 + smooth_t * 100),
                (unsigned char)(100 + smooth_t * 155),
                (unsigned char)(34 + smooth_t * 50),
                255
            };
        default: // Monochrome
            {
                unsigned char value = (unsigned char)(smooth_t * 255);
                return (Color){value, value, value, 255};
            }
    }
}

int MandelbrotIterations(float x0, float y0) {
    float x = 0, y = 0;
    int iterations = 0;
    
    while (x*x + y*y <= 4 && iterations < MAX_ITERATIONS) {
        float xtemp = x*x - y*y + x0;
        y = 2*x*y + y0;
        x = xtemp;
        iterations++;
    }
    
    return iterations;
}

int JuliaIterations(float x0, float y0) {
    float x = x0, y = y0;
    int iterations = 0;
    
    while (x*x + y*y <= 4 && iterations < MAX_ITERATIONS) {
        float xtemp = x*x - y*y + juliaReal;
        y = 2*x*y + juliaImag;
        x = xtemp;
        iterations++;
    }
    
    return iterations;
}

int BurningShipIterations(float x0, float y0) {
    float x = 0, y = 0;
    int iterations = 0;
    
    while (x*x + y*y <= 4 && iterations < MAX_ITERATIONS) {
        float xtemp = x*x - y*y + x0;
        y = fabsf(2*x*y) + y0;
        x = fabsf(xtemp);
        iterations++;
    }
    
    return iterations;
}

int SierpinskiCarpet(int x, int y, int size) {
    while (size > 0) {
        if (x % 3 == 1 && y % 3 == 1) {
            return 0;
        }
        x /= 3;
        y /= 3;
        size /= 3;
    }
    return 1;
}

void DrawFractal() {
    BeginTextureMode(fractalTexture);
    ClearBackground(WHITE);
    
    if (fractal.fractalType == 3) {
        // Sierpinski Carpet
        for (int y = 0; y < SCREEN_HEIGHT; y++) {
            for (int x = 0; x < SCREEN_WIDTH; x++) {
                if (SierpinskiCarpet(x, y, 243)) {
                    Color c = GetFractalColor(50, 100);
                    DrawPixel(x, y, c);
                }
            }
        }
    } else {
        // Complex fractals
        for (int py = 0; py < SCREEN_HEIGHT; py++) {
            for (int px = 0; px < SCREEN_WIDTH; px++) {
                float x = (px - SCREEN_WIDTH/2.0f) / (SCREEN_WIDTH/4.0f) / fractal.zoom + fractal.centerX;
                float y = (py - SCREEN_HEIGHT/2.0f) / (SCREEN_HEIGHT/4.0f) / fractal.zoom + fractal.centerY;
                
                int iterations = 0;
                switch (fractal.fractalType) {
                    case 0:
                        iterations = MandelbrotIterations(x, y);
                        break;
                    case 1:
                        iterations = JuliaIterations(x, y);
                        break;
                    case 2:
                        iterations = BurningShipIterations(x, y);
                        break;
                }
                
                Color pixelColor = GetFractalColor(iterations, MAX_ITERATIONS);
                DrawPixel(px, py, pixelColor);
            }
        }
    }
    
    EndTextureMode();
}

void UpdateFractal(float deltaTime) {
    animTime += deltaTime;
    
    // Slow zoom animation
    fractal.zoom *= 1.0f + deltaTime * 0.05f;
    
    // Slight rotation for Julia sets
    if (fractal.fractalType == 1) {
        juliaReal = -0.7f + sinf(animTime * 0.1f) * 0.1f;
        juliaImag = 0.27015f + cosf(animTime * 0.1f) * 0.1f;
    }
}

EMSCRIPTEN_KEEPALIVE
void GenerateFractal() {
    InitFractal();
    DrawFractal();
}

EMSCRIPTEN_KEEPALIVE
void SetFractalType(int type) {
    fractal.fractalType = type % 4;
    DrawFractal();
}

EMSCRIPTEN_KEEPALIVE
void SetColorScheme(int scheme) {
    fractal.colorScheme = scheme % 5;
    DrawFractal();
}

EMSCRIPTEN_KEEPALIVE
void ZoomFractal(float factor) {
    fractal.zoom *= factor;
    if (fractal.zoom < 0.1f) fractal.zoom = 0.1f;
    if (fractal.zoom > 1000.0f) fractal.zoom = 1000.0f;
    DrawFractal();
}

EMSCRIPTEN_KEEPALIVE
void PanFractal(float dx, float dy) {
    fractal.centerX += dx / fractal.zoom;
    fractal.centerY += dy / fractal.zoom;
    DrawFractal();
}

void MainLoopFractal() {
    UpdateFractal(GetFrameTime());
    
    BeginDrawing();
    ClearBackground(RAYWHITE);
    
    DrawTextureRec(fractalTexture.texture, 
                   (Rectangle){0, 0, SCREEN_WIDTH, -SCREEN_HEIGHT}, 
                   (Vector2){0, 0}, WHITE);
    
    EndDrawing();
}

int main() {
    srand(time(NULL));  // Initialize C random seed for true randomness
    SetRandomSeed(time(NULL));
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Fractal Gallery");
    SetTargetFPS(30);
    
    fractalTexture = LoadRenderTexture(SCREEN_WIDTH, SCREEN_HEIGHT);
    InitFractal();
    DrawFractal();
    
    emscripten_set_main_loop(MainLoopFractal, 0, 1);
    
    UnloadRenderTexture(fractalTexture);
    CloseWindow();
    return 0;
}