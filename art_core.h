#ifndef ART_CORE_H
#define ART_CORE_H

#include "raylib.h"
#include <math.h>
#include <stdlib.h>

#define SCREEN_WIDTH 1200
#define SCREEN_HEIGHT 800
#define MAX_PARTICLES 500

// Base art module structure
typedef struct ArtModule {
    const char* name;
    void (*init)(void);
    void (*update)(float deltaTime);
    void (*draw)(void);
    void (*cleanup)(void);
    void (*handleInput)(void);
} ArtModule;

// Particle system for effects
typedef struct {
    Vector2 position;
    float radius;
    Color color;
    float angle;
    float speed;
    float lifeTime;
} Particle;

// Global animation settings
typedef struct {
    float speed;
    float time;
    bool paused;
    float smoothness;
} AnimationSettings;

// Shared utilities
Color LerpColor(Color a, Color b, float t);
Vector2 PolarToCartesian(float angle, float radius);
float SmoothStep(float edge0, float edge1, float x);
void InitParticleSystem(Particle* particles, int count);
void UpdateParticleSystem(Particle* particles, int count, float deltaTime);
void DrawParticleSystem(Particle* particles, int count, float alpha);

// Module registry
void RegisterModule(ArtModule* module);
ArtModule* GetCurrentModule(void);
void NextModule(void);
void PreviousModule(void);
int GetModuleCount(void);
const char* GetModuleName(int index);

#endif // ART_CORE_H