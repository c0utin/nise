#include "raylib.h"
#include <math.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>
#include <time.h>

#define SCREEN_WIDTH 800
#define SCREEN_HEIGHT 600

typedef struct {
    float x, y, width, height;
    int active;
    int type;
    float rotation;
    float scale;
    Color color;
} ArtZone;

typedef struct {
    float time;
    float globalHue;
    ArtZone zones[20];
    int seed;
    float nextRandomize;
} ArtState;

static ArtState state = {0};

void RandomizeZones(void) {
    state.seed = GetRandomValue(0, 99999);
    SetRandomSeed(state.seed);
    
    for (int i = 0; i < 20; i++) {
        state.zones[i].active = GetRandomValue(0, 100) < 60;
        
        if (state.zones[i].active) {
            state.zones[i].x = GetRandomValue(50, SCREEN_WIDTH - 150);
            state.zones[i].y = GetRandomValue(50, SCREEN_HEIGHT - 150);
            state.zones[i].width = GetRandomValue(80, 250);
            state.zones[i].height = GetRandomValue(80, 250);
            state.zones[i].type = GetRandomValue(0, 5);
            state.zones[i].rotation = GetRandomValue(0, 360) * DEG2RAD;
            state.zones[i].scale = GetRandomValue(50, 150) / 100.0f;
            
            float hue = GetRandomValue(0, 360);
            float sat = GetRandomValue(20, 80) / 100.0f;
            float val = GetRandomValue(70, 100) / 100.0f;
            state.zones[i].color = ColorFromHSV(hue, sat, val);
        }
    }
    
    state.nextRandomize = state.time + GetRandomValue(5, 15);
}

void DrawMiniFlowField(float x, float y, float w, float h, float time, Color tint) {
    int gridSize = 15;
    float scale = 0.08f;
    
    BeginScissorMode(x, y, w, h);
    
    for (int px = x; px < x + w; px += gridSize) {
        for (int py = y; py < y + h; py += gridSize) {
            if (GetRandomValue(0, 100) < 70) {
                float angle = sinf(px * scale + time) * cosf(py * scale - time) * PI;
                float length = gridSize * 0.6f;
                
                Vector2 start = {px + gridSize/2.0f, py + gridSize/2.0f};
                Vector2 end = {
                    start.x + cosf(angle) * length,
                    start.y + sinf(angle) * length
                };
                
                Color c = tint;
                c.a = GetRandomValue(100, 200);
                DrawLineEx(start, end, GetRandomValue(1, 3), c);
            }
        }
    }
    
    EndScissorMode();
}

void DrawMiniMandala(float cx, float cy, float radius, float time, Color tint) {
    int segments = GetRandomValue(6, 12);
    int layers = GetRandomValue(3, 6);
    
    for (int layer = 0; layer < layers; layer++) {
        float r = radius * (layer + 1) / layers;
        float rotation = time * (layer % 2 == 0 ? 0.3f : -0.3f);
        
        for (int seg = 0; seg < segments; seg++) {
            if (GetRandomValue(0, 100) < 80) {
                float angle = (2.0f * PI * seg / segments) + rotation;
                float nextAngle = (2.0f * PI * (seg + 1) / segments) + rotation;
                
                Vector2 p1 = {cx + cosf(angle) * r, cy + sinf(angle) * r};
                Vector2 p2 = {cx + cosf(nextAngle) * r, cy + sinf(nextAngle) * r};
                
                Color c = tint;
                c.a = GetRandomValue(150, 255);
                DrawLineEx(p1, p2, GetRandomValue(1, 2), c);
            }
        }
    }
}

void DrawMiniParticles(float x, float y, float w, float h, float time, Color tint) {
    BeginScissorMode(x, y, w, h);
    
    int particleCount = GetRandomValue(20, 50);
    for (int i = 0; i < particleCount; i++) {
        float px = x + sinf(time * 0.5f + i * 0.5f) * w * 0.4f + w * 0.5f;
        float py = y + cosf(time * 0.3f + i * 0.7f) * h * 0.4f + h * 0.5f;
        
        if (GetRandomValue(0, 100) < 70) {
            Color c = tint;
            c.a = GetRandomValue(100, 200);
            float size = GetRandomValue(2, 8);
            DrawCircle(px, py, size, c);
        }
    }
    
    EndScissorMode();
}

void DrawMiniSpiral(float cx, float cy, float maxRadius, float time, Color tint) {
    float a = 0;
    float b = GetRandomValue(5, 15) / 10.0f;
    Vector2 prev = {cx, cy};
    
    for (float angle = 0; angle < 20; angle += 0.1f) {
        float r = a + b * angle;
        if (r > maxRadius) break;
        
        float x = cx + r * cosf(angle + time * 0.5f);
        float y = cy + r * sinf(angle + time * 0.5f);
        
        if (GetRandomValue(0, 100) < 90) {
            Color c = tint;
            c.a = GetRandomValue(100, 255);
            DrawLineEx(prev, (Vector2){x, y}, GetRandomValue(1, 3), c);
        }
        
        prev = (Vector2){x, y};
    }
}

void DrawMiniDots(float x, float y, float w, float h, Color tint) {
    BeginScissorMode(x, y, w, h);
    
    int dotCount = GetRandomValue(10, 30);
    for (int i = 0; i < dotCount; i++) {
        if (GetRandomValue(0, 100) < 60) {
            float dx = x + GetRandomValue(10, w - 10);
            float dy = y + GetRandomValue(10, h - 10);
            float size = GetRandomValue(3, 15);
            
            Color c = tint;
            c.a = GetRandomValue(50, 180);
            DrawCircle(dx, dy, size, c);
        }
    }
    
    EndScissorMode();
}

void DrawMiniLines(float x, float y, float w, float h, float time, Color tint) {
    BeginScissorMode(x, y, w, h);
    
    int lineCount = GetRandomValue(5, 15);
    for (int i = 0; i < lineCount; i++) {
        if (GetRandomValue(0, 100) < 70) {
            float x1 = x + GetRandomValue(0, w);
            float y1 = y + GetRandomValue(0, h);
            float x2 = x + GetRandomValue(0, w);
            float y2 = y + GetRandomValue(0, h);
            
            Color c = tint;
            c.a = GetRandomValue(80, 200);
            float thickness = GetRandomValue(1, 4);
            
            DrawLineEx((Vector2){x1, y1}, (Vector2){x2, y2}, thickness, c);
        }
    }
    
    EndScissorMode();
}

void UpdateFrame(void) {
    state.time += GetFrameTime();
    
    if (state.time > state.nextRandomize || IsKeyPressed(KEY_SPACE)) {
        RandomizeZones();
    }
    
    BeginDrawing();
    ClearBackground(WHITE);
    
    for (int i = 0; i < 20; i++) {
        if (!state.zones[i].active) continue;
        
        ArtZone* zone = &state.zones[i];
        
        float animTime = state.time * zone->scale;
        
        switch (zone->type) {
            case 0:
                DrawMiniFlowField(zone->x, zone->y, zone->width, zone->height, animTime, zone->color);
                break;
            case 1:
                DrawMiniMandala(zone->x + zone->width/2, zone->y + zone->height/2, 
                              fminf(zone->width, zone->height) / 2, animTime, zone->color);
                break;
            case 2:
                DrawMiniParticles(zone->x, zone->y, zone->width, zone->height, animTime, zone->color);
                break;
            case 3:
                DrawMiniSpiral(zone->x + zone->width/2, zone->y + zone->height/2,
                             fminf(zone->width, zone->height) / 2, animTime, zone->color);
                break;
            case 4:
                DrawMiniDots(zone->x, zone->y, zone->width, zone->height, zone->color);
                break;
            case 5:
                DrawMiniLines(zone->x, zone->y, zone->width, zone->height, animTime, zone->color);
                break;
        }
    }
    
    DrawText("SPACE: New Composition", 10, SCREEN_HEIGHT - 25, 16, DARKGRAY);
    
    EndDrawing();
}

int main(void) {
    InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, "Art Generator - Pure C + Raylib");
    SetTargetFPS(60);
    
    RandomizeZones();
    
    #ifdef PLATFORM_WEB
    emscripten_set_main_loop(UpdateFrame, 0, 1);
    #else
    while (!WindowShouldClose()) {
        UpdateFrame();
    }
    CloseWindow();
    #endif
    
    return 0;
}