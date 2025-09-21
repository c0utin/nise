#include "art_core.h"

typedef struct {
    float centerX;
    float centerY;
    int segments;
    float rotation;
    float scale;
    Color primaryColor;
    Color secondaryColor;
    float animationTime;
    float speed;
} MandalaState;

static MandalaState mandala;
static Particle particles[MAX_PARTICLES];
static AnimationSettings animation = { 0.3f, 0.0f, false, 1.0f };

static void DrawMandalaPattern(float centerX, float centerY, float radius, int segments, float rotation) {
    float angleStep = (2.0f * PI) / segments;
    
    for (int i = 0; i < segments; i++) {
        float angle = i * angleStep + rotation;
        float nextAngle = (i + 1) * angleStep + rotation;
        
        Vector2 p1 = { centerX + cosf(angle) * radius, centerY + sinf(angle) * radius };
        Vector2 p2 = { centerX + cosf(nextAngle) * radius, centerY + sinf(nextAngle) * radius };
        Vector2 center = { centerX, centerY };
        
        // Draw filled triangles for petals
        DrawTriangle(center, p1, p2, Fade(mandala.primaryColor, 0.6f));
        DrawTriangleLines(center, p1, p2, mandala.secondaryColor);
        
        // Draw inner circles
        float innerRadius = radius * 0.5f;
        Vector2 innerPoint = { 
            centerX + cosf(angle + angleStep/2) * innerRadius, 
            centerY + sinf(angle + angleStep/2) * innerRadius 
        };
        DrawCircle(innerPoint.x, innerPoint.y, 10, Fade(mandala.secondaryColor, 0.8f));
        
        // Draw decorative lines
        float decorRadius = radius * 0.7f;
        Vector2 decorPoint = { 
            centerX + cosf(angle) * decorRadius, 
            centerY + sinf(angle) * decorRadius 
        };
        DrawLineEx(center, decorPoint, 2.0f, Fade(mandala.primaryColor, 0.4f));
    }
    
    // Draw center circle
    DrawCircle(centerX, centerY, radius * 0.15f, mandala.primaryColor);
    DrawCircleLines(centerX, centerY, radius * 0.15f, mandala.secondaryColor);
}

static void Mandala_Init(void) {
    mandala.centerX = SCREEN_WIDTH / 2.0f;
    mandala.centerY = SCREEN_HEIGHT / 2.0f;
    mandala.segments = 12;
    mandala.rotation = 0.0f;
    mandala.scale = 1.0f;
    mandala.primaryColor = (Color){ 139, 69, 19, 255 };
    mandala.secondaryColor = (Color){ 255, 215, 0, 255 };
    mandala.animationTime = 0.0f;
    mandala.speed = 0.3f;
    
    InitParticleSystem(particles, MAX_PARTICLES);
}

static void Mandala_Update(float deltaTime) {
    if (!animation.paused) {
        mandala.animationTime += deltaTime * mandala.speed;
        mandala.rotation = sinf(mandala.animationTime) * 0.2f * animation.smoothness;
        UpdateParticleSystem(particles, MAX_PARTICLES, deltaTime);
    }
}

static void Mandala_Draw(void) {
    // Background gradient
    DrawRectangleGradientV(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 
                           (Color){10, 10, 20, 255}, (Color){30, 20, 40, 255});
    
    // Draw particles in background
    DrawParticleSystem(particles, MAX_PARTICLES, 0.2f);
    
    // Draw multiple layers of mandala patterns
    float baseRadius = 200.0f;
    
    for (int layer = 0; layer < 3; layer++) {
        float layerRadius = baseRadius * (1.0f + layer * 0.3f);
        float layerRotation = mandala.rotation + layer * (PI / 6);
        int layerSegments = mandala.segments + layer * 4;
        
        DrawMandalaPattern(
            mandala.centerX, 
            mandala.centerY, 
            layerRadius * (1.0f + sinf(mandala.animationTime + layer) * 0.1f * animation.smoothness),
            layerSegments,
            layerRotation
        );
    }
}

static void Mandala_HandleInput(void) {
    if (IsKeyPressed(KEY_UP)) {
        mandala.speed = fminf(mandala.speed + 0.1f, 2.0f);
    }
    if (IsKeyPressed(KEY_DOWN)) {
        mandala.speed = fmaxf(mandala.speed - 0.1f, 0.1f);
    }
    if (IsKeyPressed(KEY_P)) {
        animation.paused = !animation.paused;
    }
    if (IsKeyPressed(KEY_R)) {
        Mandala_Init();
    }
    if (IsKeyPressed(KEY_LEFT)) {
        mandala.segments = fmaxf(3, mandala.segments - 1);
    }
    if (IsKeyPressed(KEY_RIGHT)) {
        mandala.segments = fminf(24, mandala.segments + 1);
    }
}

static void Mandala_Cleanup(void) {
    // Cleanup if needed
}

static ArtModule mandalaModule = {
    .name = "Mandala",
    .init = Mandala_Init,
    .update = Mandala_Update,
    .draw = Mandala_Draw,
    .cleanup = Mandala_Cleanup,
    .handleInput = Mandala_HandleInput
};

ArtModule* GetMandalaModule(void) {
    return &mandalaModule;
}