#include "raylib.h"
#include <math.h>
#include <stdlib.h>
#include <time.h>

#define SCREEN_WIDTH 1200
#define SCREEN_HEIGHT 800
#define MAX_PARTICLES 500

typedef enum {
    ART_MANDALA,
    ART_FRACTAL,
    ART_COMBINED
} ArtType;

typedef struct {
    Vector2 position;
    float radius;
    Color color;
    float angle;
    float speed;
    float lifeTime;
} Particle;

typedef struct {
    float centerX;
    float centerY;
    int segments;
    float rotation;
    float scale;
    Color primaryColor;
    Color secondaryColor;
    float animationTime;
} MandalaState;

typedef struct {
    float zoom;
    float offsetX;
    float offsetY;
    int iterations;
    float animationTime;
    Color palette[256];
} FractalState;

Particle particles[MAX_PARTICLES];
MandalaState mandala;
FractalState fractal;
ArtType currentArt = ART_COMBINED;
float globalTime = 0.0f;
float animationSpeed = 0.3f; // Slower animation speed

void InitParticles() {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].position = (Vector2){ GetRandomValue(0, SCREEN_WIDTH), GetRandomValue(0, SCREEN_HEIGHT) };
        particles[i].radius = GetRandomValue(2, 8);
        particles[i].color = (Color){ 
            GetRandomValue(100, 255), 
            GetRandomValue(100, 255), 
            GetRandomValue(100, 255), 
            GetRandomValue(50, 150) 
        };
        particles[i].angle = GetRandomValue(0, 360) * DEG2RAD;
        particles[i].speed = GetRandomValue(10, 50) * 0.01f;
        particles[i].lifeTime = GetRandomValue(3.0f, 10.0f);
    }
}

void InitMandala() {
    mandala.centerX = SCREEN_WIDTH / 2.0f;
    mandala.centerY = SCREEN_HEIGHT / 2.0f;
    mandala.segments = 12;
    mandala.rotation = 0.0f;
    mandala.scale = 1.0f;
    mandala.primaryColor = (Color){ 139, 69, 19, 255 }; // Saddle Brown
    mandala.secondaryColor = (Color){ 255, 215, 0, 255 }; // Gold
    mandala.animationTime = 0.0f;
}

void InitFractal() {
    fractal.zoom = 1.0f;
    fractal.offsetX = 0.0f;
    fractal.offsetY = 0.0f;
    fractal.iterations = 128;
    fractal.animationTime = 0.0f;
    
    // Create a smooth color palette
    for (int i = 0; i < 256; i++) {
        float t = (float)i / 255.0f;
        fractal.palette[i] = (Color){
            (unsigned char)(sin(t * PI + 0) * 127 + 128),
            (unsigned char)(sin(t * PI + 2) * 127 + 128),
            (unsigned char)(sin(t * PI + 4) * 127 + 128),
            255
        };
    }
}

void UpdateParticles(float deltaTime) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].lifeTime -= deltaTime;
        
        if (particles[i].lifeTime <= 0) {
            particles[i].position = (Vector2){ GetRandomValue(0, SCREEN_WIDTH), GetRandomValue(0, SCREEN_HEIGHT) };
            particles[i].lifeTime = GetRandomValue(3.0f, 10.0f);
            particles[i].angle = GetRandomValue(0, 360) * DEG2RAD;
        }
        
        // Smooth floating motion
        particles[i].position.x += cos(particles[i].angle) * particles[i].speed;
        particles[i].position.y += sin(particles[i].angle) * particles[i].speed;
        particles[i].angle += deltaTime * 0.5f;
        
        // Wrap around screen
        if (particles[i].position.x < 0) particles[i].position.x = SCREEN_WIDTH;
        if (particles[i].position.x > SCREEN_WIDTH) particles[i].position.x = 0;
        if (particles[i].position.y < 0) particles[i].position.y = SCREEN_HEIGHT;
        if (particles[i].position.y > SCREEN_HEIGHT) particles[i].position.y = 0;
    }
}

void DrawMandalaPattern(float centerX, float centerY, float radius, int segments, float rotation) {
    float angleStep = (2.0f * PI) / segments;
    
    for (int i = 0; i < segments; i++) {
        float angle = i * angleStep + rotation;
        float nextAngle = (i + 1) * angleStep + rotation;
        
        // Draw main petals
        Vector2 p1 = { centerX + cos(angle) * radius, centerY + sin(angle) * radius };
        Vector2 p2 = { centerX + cos(nextAngle) * radius, centerY + sin(nextAngle) * radius };
        Vector2 center = { centerX, centerY };
        
        // Draw filled triangles for petals
        DrawTriangle(center, p1, p2, Fade(mandala.primaryColor, 0.6f));
        DrawTriangleLines(center, p1, p2, mandala.secondaryColor);
        
        // Draw inner circles
        float innerRadius = radius * 0.5f;
        Vector2 innerPoint = { 
            centerX + cos(angle + angleStep/2) * innerRadius, 
            centerY + sin(angle + angleStep/2) * innerRadius 
        };
        DrawCircle(innerPoint.x, innerPoint.y, 10, Fade(mandala.secondaryColor, 0.8f));
        
        // Draw decorative lines
        float decorRadius = radius * 0.7f;
        Vector2 decorPoint = { 
            centerX + cos(angle) * decorRadius, 
            centerY + sin(angle) * decorRadius 
        };
        DrawLineEx(center, decorPoint, 2.0f, Fade(mandala.primaryColor, 0.4f));
    }
    
    // Draw center circle
    DrawCircle(centerX, centerY, radius * 0.15f, mandala.primaryColor);
    DrawCircleLines(centerX, centerY, radius * 0.15f, mandala.secondaryColor);
}

void DrawMandala() {
    mandala.animationTime += GetFrameTime() * animationSpeed;
    mandala.rotation = sin(mandala.animationTime) * 0.2f;
    
    // Draw multiple layers of mandala patterns
    float baseRadius = 200.0f;
    
    for (int layer = 0; layer < 3; layer++) {
        float layerRadius = baseRadius * (1.0f + layer * 0.3f);
        float layerRotation = mandala.rotation + layer * (PI / 6);
        int layerSegments = mandala.segments + layer * 4;
        
        DrawMandalaPattern(
            mandala.centerX, 
            mandala.centerY, 
            layerRadius * (1.0f + sin(mandala.animationTime + layer) * 0.1f),
            layerSegments,
            layerRotation
        );
    }
}

int CalculateMandelbrot(float x, float y, int maxIterations) {
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

void DrawFractal() {
    fractal.animationTime += GetFrameTime() * animationSpeed * 0.5f;
    fractal.zoom = 1.0f + sin(fractal.animationTime) * 0.3f;
    
    float scale = 3.0f / (fractal.zoom * fminf(SCREEN_WIDTH, SCREEN_HEIGHT));
    
    // Draw fractal using points for performance
    for (int x = 0; x < SCREEN_WIDTH; x += 2) {
        for (int y = 0; y < SCREEN_HEIGHT; y += 2) {
            float real = (x - SCREEN_WIDTH / 2.0f) * scale + fractal.offsetX;
            float imag = (y - SCREEN_HEIGHT / 2.0f) * scale + fractal.offsetY;
            
            int iterations = CalculateMandelbrot(real, imag, fractal.iterations);
            
            if (iterations < fractal.iterations) {
                Color color = fractal.palette[iterations % 256];
                DrawRectangle(x, y, 2, 2, Fade(color, 0.8f));
            }
        }
    }
}

void DrawCombinedArt() {
    // Draw fractal as background with transparency
    BeginBlendMode(BLEND_ALPHA);
    DrawFractal();
    
    // Draw semi-transparent overlay
    DrawRectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, Fade(BLACK, 0.3f));
    
    // Draw mandala on top
    DrawMandala();
    
    // Draw particles for additional effect
    for (int i = 0; i < MAX_PARTICLES; i++) {
        DrawCircleV(particles[i].position, particles[i].radius, Fade(particles[i].color, 0.3f));
    }
    EndBlendMode();
}

int main(void) {
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Art Generator - Fractals & Mandalas");
    SetTargetFPS(60);
    
    // Initialize random seed
    srand(time(NULL));
    
    // Initialize art components
    InitParticles();
    InitMandala();
    InitFractal();
    
    while (!WindowShouldClose()) {
        // Update
        float deltaTime = GetFrameTime();
        globalTime += deltaTime;
        UpdateParticles(deltaTime);
        
        // Input handling
        if (IsKeyPressed(KEY_SPACE)) {
            currentArt = (currentArt + 1) % 3;
        }
        
        if (IsKeyPressed(KEY_R)) {
            InitParticles();
            InitMandala();
            InitFractal();
        }
        
        // Adjust animation speed with arrow keys
        if (IsKeyPressed(KEY_UP)) animationSpeed = fminf(animationSpeed + 0.1f, 2.0f);
        if (IsKeyPressed(KEY_DOWN)) animationSpeed = fmaxf(animationSpeed - 0.1f, 0.1f);
        
        // Draw
        BeginDrawing();
        ClearBackground(BLACK);
        
        switch(currentArt) {
            case ART_MANDALA:
                DrawMandala();
                break;
            case ART_FRACTAL:
                DrawFractal();
                break;
            case ART_COMBINED:
                DrawCombinedArt();
                break;
        }
        
        // Draw UI
        DrawText("Press SPACE to switch art type", 10, 10, 20, WHITE);
        DrawText("Press R to regenerate", 10, 35, 20, WHITE);
        DrawText("Press UP/DOWN to adjust speed", 10, 60, 20, WHITE);
        
        const char* artTypeName = currentArt == ART_MANDALA ? "MANDALA" : 
                                  currentArt == ART_FRACTAL ? "FRACTAL" : "COMBINED";
        DrawText(TextFormat("Current: %s | Speed: %.1fx", artTypeName, animationSpeed), 
                 10, SCREEN_HEIGHT - 30, 20, GREEN);
        
        EndDrawing();
    }
    
    CloseWindow();
    return 0;
}