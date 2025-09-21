#include "raylib.h"
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <emscripten/emscripten.h>

#define SCREEN_WIDTH 800
#define SCREEN_HEIGHT 800
#define MAX_LAYERS 12
#define MAX_ELEMENTS 360

typedef struct {
    float radius;
    float angle;
    float speed;
    float size;
    Color color;
    int shape;
    float phase;
    float amplitude;
} MandalaElement;

typedef struct {
    MandalaElement elements[MAX_ELEMENTS];
    int count;
    float rotation;
    float scale;
    float pulsePhase;
} MandalaLayer;

MandalaLayer layers[MAX_LAYERS];
int layerCount;
float globalTime = 0;
float morphTime = 0;
RenderTexture2D target;

Color GetArtisticColor() {
    int palette = GetRandomValue(0, 6);
    switch(palette) {
        case 0: // Earth tones
            return (Color){
                GetRandomValue(139, 180),
                GetRandomValue(69, 100),
                GetRandomValue(19, 60),
                GetRandomValue(180, 220)
            };
        case 1: // Ocean blues
            return (Color){
                GetRandomValue(30, 70),
                GetRandomValue(90, 130),
                GetRandomValue(140, 180),
                GetRandomValue(160, 200)
            };
        case 2: // Warm sunset
            return (Color){
                GetRandomValue(180, 220),
                GetRandomValue(100, 140),
                GetRandomValue(60, 100),
                GetRandomValue(170, 210)
            };
        case 3: // Forest greens
            return (Color){
                GetRandomValue(34, 74),
                GetRandomValue(100, 140),
                GetRandomValue(34, 74),
                GetRandomValue(180, 220)
            };
        case 4: // Stone grays
            return (Color){
                GetRandomValue(100, 140),
                GetRandomValue(100, 140),
                GetRandomValue(100, 140),
                GetRandomValue(190, 230)
            };
        case 5: // Soft pastels
            return (Color){
                GetRandomValue(200, 240),
                GetRandomValue(180, 220),
                GetRandomValue(200, 240),
                GetRandomValue(150, 190)
            };
        default: // Classic black/white
            {
                int value = GetRandomValue(0, 1) * 255;
                return (Color){value, value, value, GetRandomValue(180, 255)};
            }
    }
}

void DrawArtisticShape(float x, float y, float size, int shape, Color color, float rotation) {
    switch(shape % 8) {
        case 0: // Morphing circle
            DrawCircle(x, y, size * (1.0f + 0.3f * sinf(globalTime * 3)), color);
            break;
        case 1: // Star
            for(int i = 0; i < 5; i++) {
                float angle1 = rotation + (i * 72 * DEG2RAD);
                float angle2 = rotation + ((i + 1) * 72 * DEG2RAD);
                DrawTriangle(
                    (Vector2){x, y},
                    (Vector2){x + cosf(angle1) * size, y + sinf(angle1) * size},
                    (Vector2){x + cosf(angle2) * size * 0.4f, y + sinf(angle2) * size * 0.4f},
                    color
                );
            }
            break;
        case 2: // Eye
            DrawEllipse(x, y, size * 1.5f, size * 0.7f, color);
            DrawCircle(x, y, size * 0.4f, Fade(BLACK, 0.8f));
            DrawCircle(x + size * 0.1f, y - size * 0.1f, size * 0.15f, WHITE);
            break;
        case 3: // Triangle spiral
            for(int i = 0; i < 3; i++) {
                float scale = 1.0f - (i * 0.3f);
                float angle = rotation + (i * 30 * DEG2RAD);
                DrawPoly((Vector2){x, y}, 3, size * scale, angle * RAD2DEG, color);
            }
            break;
        case 4: // Flower
            for(int i = 0; i < 8; i++) {
                float petalAngle = rotation + (i * 45 * DEG2RAD);
                float px = x + cosf(petalAngle) * size * 0.5f;
                float py = y + sinf(petalAngle) * size * 0.5f;
                DrawEllipse(px, py, size * 0.6f, size * 0.3f, color);
            }
            DrawCircle(x, y, size * 0.3f, Fade(color, 0.7f));
            break;
        case 5: // Crescent moon
            DrawCircle(x, y, size, color);
            DrawCircle(x + size * 0.3f, y, size * 0.9f, (Color){0, 0, 0, 255});
            break;
        case 6: // Hexagon web
            DrawPoly((Vector2){x, y}, 6, size, rotation * RAD2DEG, color);
            for(int i = 0; i < 6; i++) {
                float angle = rotation + (i * 60 * DEG2RAD);
                DrawLine(x, y, 
                    x + cosf(angle) * size, 
                    y + sinf(angle) * size, 
                    Fade(color, 0.5f));
            }
            break;
        case 7: // Spiral dots
            for(int i = 0; i < 12; i++) {
                float spiralAngle = rotation + (i * 30 * DEG2RAD);
                float spiralRadius = size * (0.2f + (i * 0.08f));
                float dx = x + cosf(spiralAngle) * spiralRadius;
                float dy = y + sinf(spiralAngle) * spiralRadius;
                DrawCircle(dx, dy, size * 0.15f, color);
            }
            break;
    }
}

void GenerateMandala() {
    layerCount = GetRandomValue(4, MAX_LAYERS);
    
    for(int l = 0; l < layerCount; l++) {
        MandalaLayer *layer = &layers[l];
        layer->count = GetRandomValue(6, 24);
        layer->rotation = GetRandomValue(0, 360) * DEG2RAD;
        layer->scale = 0.5f + (float)GetRandomValue(0, 100) / 100.0f;
        layer->pulsePhase = GetRandomValue(0, 360) * DEG2RAD;
        
        float baseRadius = 50 + (l * 40) + GetRandomValue(-20, 20);
        
        for(int e = 0; e < layer->count; e++) {
            MandalaElement *elem = &layer->elements[e];
            
            elem->radius = baseRadius + GetRandomValue(-30, 30);
            elem->angle = (360.0f / layer->count) * e * DEG2RAD + GetRandomValue(-10, 10) * DEG2RAD;
            elem->speed = (GetRandomValue(-100, 100) / 100.0f) * 0.02f;
            elem->size = 10 + GetRandomValue(5, 30);
            elem->color = GetArtisticColor();
            elem->shape = GetRandomValue(0, 7);
            elem->phase = GetRandomValue(0, 360) * DEG2RAD;
            elem->amplitude = GetRandomValue(5, 20);
        }
    }
}

void UpdateMandala(float deltaTime) {
    globalTime += deltaTime;
    morphTime += deltaTime * 0.5f;
    
    for(int l = 0; l < layerCount; l++) {
        MandalaLayer *layer = &layers[l];
        layer->rotation += deltaTime * 0.1f * (l % 2 == 0 ? 1 : -1);
        
        for(int e = 0; e < layer->count; e++) {
            MandalaElement *elem = &layer->elements[e];
            elem->angle += elem->speed;
            elem->phase += deltaTime * 2;
        }
    }
}

void DrawMandala() {
    Vector2 center = {SCREEN_WIDTH / 2.0f, SCREEN_HEIGHT / 2.0f};
    
    // Draw artistic gradient background
    for(int i = 0; i < SCREEN_HEIGHT; i++) {
        float t = (float)i / SCREEN_HEIGHT;
        float fade = 1.0f - t * 0.3f;
        Color gradColor = (Color){
            (unsigned char)(245 * fade),
            (unsigned char)(245 * fade),
            (unsigned char)(240 * fade),
            255
        };
        DrawRectangle(0, i, SCREEN_WIDTH, 1, gradColor);
    }
    
    // Draw mandala layers
    for(int l = 0; l < layerCount; l++) {
        MandalaLayer *layer = &layers[l];
        float layerPulse = 1.0f + 0.1f * sinf(globalTime * 2 + layer->pulsePhase);
        
        for(int e = 0; e < layer->count; e++) {
            MandalaElement *elem = &layer->elements[e];
            
            // Calculate morphing position
            float morphRadius = elem->radius + elem->amplitude * sinf(elem->phase);
            float finalAngle = elem->angle + layer->rotation;
            
            float x = center.x + cosf(finalAngle) * morphRadius * layer->scale * layerPulse;
            float y = center.y + sinf(finalAngle) * morphRadius * layer->scale * layerPulse;
            
            // Draw with symmetry
            int symmetry = GetRandomValue(0, 100) > 70 ? 2 : 1;
            for(int s = 0; s < symmetry; s++) {
                float symAngle = finalAngle + (s * PI);
                float sx = center.x + cosf(symAngle) * morphRadius * layer->scale * layerPulse;
                float sy = center.y + sinf(symAngle) * morphRadius * layer->scale * layerPulse;
                
                Color fadedColor = Fade(elem->color, 0.7f + 0.3f * sinf(elem->phase));
                DrawArtisticShape(sx, sy, elem->size * layerPulse, elem->shape, fadedColor, finalAngle);
            }
            
            // Draw connections
            if(e > 0 && GetRandomValue(0, 100) > 60) {
                MandalaElement *prevElem = &layer->elements[e - 1];
                float prevAngle = prevElem->angle + layer->rotation;
                float prevRadius = prevElem->radius + prevElem->amplitude * sinf(prevElem->phase);
                float px = center.x + cosf(prevAngle) * prevRadius * layer->scale * layerPulse;
                float py = center.y + sinf(prevAngle) * prevRadius * layer->scale * layerPulse;
                
                DrawLineEx((Vector2){x, y}, (Vector2){px, py}, 1.0f, Fade(elem->color, 0.3f));
            }
        }
    }
    
    // Draw center focal point
    float centerSize = 20 + 5 * sinf(globalTime * 2);
    DrawCircle(center.x, center.y, centerSize, (Color){255, 255, 255, 150});
    DrawCircle(center.x, center.y, centerSize * 0.5f, (Color){139, 69, 19, 200});
    DrawCircleLines(center.x, center.y, centerSize * 1.2f, (Color){139, 69, 19, 100});
}

void MainLoop() {
    UpdateMandala(GetFrameTime());
    
    BeginDrawing();
    ClearBackground(BLACK);
    DrawMandala();
    EndDrawing();
}

int main() {
    SetRandomSeed(time(NULL));
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Surreal Mandala Generator");
    SetTargetFPS(60);
    
    GenerateMandala();
    
    emscripten_set_main_loop(MainLoop, 0, 1);
    
    CloseWindow();
    return 0;
}