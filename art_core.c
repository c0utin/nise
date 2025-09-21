#include "art_core.h"
#include <string.h>

#define MAX_MODULES 10

static ArtModule* modules[MAX_MODULES];
static int moduleCount = 0;
static int currentModuleIndex = 0;

Color LerpColor(Color a, Color b, float t) {
    t = fmaxf(0.0f, fminf(1.0f, t));
    return (Color){
        (unsigned char)(a.r + (b.r - a.r) * t),
        (unsigned char)(a.g + (b.g - a.g) * t),
        (unsigned char)(a.b + (b.b - a.b) * t),
        (unsigned char)(a.a + (b.a - a.a) * t)
    };
}

Vector2 PolarToCartesian(float angle, float radius) {
    return (Vector2){
        cosf(angle) * radius,
        sinf(angle) * radius
    };
}

float SmoothStep(float edge0, float edge1, float x) {
    x = fmaxf(0.0f, fminf(1.0f, (x - edge0) / (edge1 - edge0)));
    return x * x * (3.0f - 2.0f * x);
}

void InitParticleSystem(Particle* particles, int count) {
    for (int i = 0; i < count; i++) {
        particles[i].position = (Vector2){ 
            GetRandomValue(0, SCREEN_WIDTH), 
            GetRandomValue(0, SCREEN_HEIGHT) 
        };
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

void UpdateParticleSystem(Particle* particles, int count, float deltaTime) {
    for (int i = 0; i < count; i++) {
        particles[i].lifeTime -= deltaTime;
        
        if (particles[i].lifeTime <= 0) {
            particles[i].position = (Vector2){ 
                GetRandomValue(0, SCREEN_WIDTH), 
                GetRandomValue(0, SCREEN_HEIGHT) 
            };
            particles[i].lifeTime = GetRandomValue(3.0f, 10.0f);
            particles[i].angle = GetRandomValue(0, 360) * DEG2RAD;
        }
        
        particles[i].position.x += cosf(particles[i].angle) * particles[i].speed;
        particles[i].position.y += sinf(particles[i].angle) * particles[i].speed;
        particles[i].angle += deltaTime * 0.5f;
        
        if (particles[i].position.x < 0) particles[i].position.x = SCREEN_WIDTH;
        if (particles[i].position.x > SCREEN_WIDTH) particles[i].position.x = 0;
        if (particles[i].position.y < 0) particles[i].position.y = SCREEN_HEIGHT;
        if (particles[i].position.y > SCREEN_HEIGHT) particles[i].position.y = 0;
    }
}

void DrawParticleSystem(Particle* particles, int count, float alpha) {
    for (int i = 0; i < count; i++) {
        DrawCircleV(particles[i].position, particles[i].radius, 
                   Fade(particles[i].color, alpha));
    }
}

void RegisterModule(ArtModule* module) {
    if (moduleCount < MAX_MODULES) {
        modules[moduleCount++] = module;
    }
}

ArtModule* GetCurrentModule(void) {
    if (moduleCount > 0) {
        return modules[currentModuleIndex];
    }
    return NULL;
}

void NextModule(void) {
    if (moduleCount > 0) {
        currentModuleIndex = (currentModuleIndex + 1) % moduleCount;
    }
}

void PreviousModule(void) {
    if (moduleCount > 0) {
        currentModuleIndex = (currentModuleIndex - 1 + moduleCount) % moduleCount;
    }
}

int GetModuleCount(void) {
    return moduleCount;
}

const char* GetModuleName(int index) {
    if (index >= 0 && index < moduleCount) {
        return modules[index]->name;
    }
    return "Unknown";
}