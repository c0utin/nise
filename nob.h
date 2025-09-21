#ifndef NOB_H_
#define NOB_H_

#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <stdbool.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include <sys/wait.h>
#include <errno.h>
#include <time.h>

#define NOB_ARRAY_LEN(xs) (sizeof(xs)/sizeof((xs)[0]))

typedef enum {
    NOB_INFO,
    NOB_WARNING,
    NOB_ERROR,
} Nob_Log_Level;

typedef struct {
    char **items;
    size_t count;
    size_t capacity;
} Nob_Cmd;

void nob_log(Nob_Log_Level level, const char *fmt, ...);
bool nob_file_exists(const char *path);
bool nob_needs_rebuild(const char *output, const char **inputs, size_t inputs_count);
bool nob_needs_rebuild1(const char *output, const char *input);
void nob_cmd_append(Nob_Cmd *cmd, ...);
bool nob_cmd_run_sync(Nob_Cmd cmd);
void nob_da_append_many(Nob_Cmd *da, const char **items, size_t items_count);
const char *nob_shift_args(int *argc, char ***argv);

#define NOB_GO_REBUILD_URSELF(argc, argv) \
    do { \
        const char *source = __FILE__; \
        const char *binary = argv[0]; \
        if (nob_needs_rebuild1(binary, source)) { \
            Nob_Cmd cmd = {0}; \
            nob_cmd_append(&cmd, "cc", "-o", binary, source, NULL); \
            nob_cmd_run_sync(cmd); \
            nob_cmd_append(&cmd, binary, NULL); \
            for (int i = 1; i < argc; ++i) { \
                nob_cmd_append(&cmd, argv[i], NULL); \
            } \
            execvp(binary, cmd.items); \
            perror("execvp"); \
            exit(1); \
        } \
    } while(0)

#ifdef NOB_IMPLEMENTATION

void nob_log(Nob_Log_Level level, const char *fmt, ...) {
    const char *level_str;
    switch (level) {
        case NOB_INFO:    level_str = "[INFO]"; break;
        case NOB_WARNING: level_str = "[WARNING]"; break;
        case NOB_ERROR:   level_str = "[ERROR]"; break;
        default:          level_str = "[UNKNOWN]"; break;
    }
    
    fprintf(stderr, "%s ", level_str);
    va_list args;
    va_start(args, fmt);
    vfprintf(stderr, fmt, args);
    va_end(args);
    fprintf(stderr, "\n");
}

bool nob_file_exists(const char *path) {
    struct stat st;
    return stat(path, &st) == 0;
}

bool nob_needs_rebuild1(const char *output, const char *input) {
    return nob_needs_rebuild(output, &input, 1);
}

bool nob_needs_rebuild(const char *output, const char **inputs, size_t inputs_count) {
    if (!nob_file_exists(output)) return true;
    
    struct stat output_stat;
    if (stat(output, &output_stat) != 0) return true;
    
    for (size_t i = 0; i < inputs_count; ++i) {
        struct stat input_stat;
        if (stat(inputs[i], &input_stat) != 0) return true;
        if (input_stat.st_mtime > output_stat.st_mtime) return true;
    }
    
    return false;
}

void nob_cmd_append(Nob_Cmd *cmd, ...) {
    va_list args;
    va_start(args, cmd);
    
    const char *arg;
    while ((arg = va_arg(args, const char *)) != NULL) {
        if (cmd->count >= cmd->capacity) {
            cmd->capacity = cmd->capacity == 0 ? 8 : cmd->capacity * 2;
            cmd->items = realloc(cmd->items, cmd->capacity * sizeof(char *));
        }
        cmd->items[cmd->count++] = (char *)arg;
    }
    
    va_end(args);
}

void nob_da_append_many(Nob_Cmd *da, const char **items, size_t items_count) {
    for (size_t i = 0; i < items_count; ++i) {
        nob_cmd_append(da, items[i], NULL);
    }
}

bool nob_cmd_run_sync(Nob_Cmd cmd) {
    if (cmd.count == 0) {
        nob_log(NOB_ERROR, "Cannot run empty command");
        return false;
    }
    
    // Null-terminate the command array
    nob_cmd_append(&cmd, NULL);
    
    // Log the command
    fprintf(stderr, "[CMD] ");
    for (size_t i = 0; i < cmd.count - 1; ++i) {
        fprintf(stderr, "%s ", cmd.items[i]);
    }
    fprintf(stderr, "\n");
    
    pid_t pid = fork();
    if (pid == 0) {
        // Child process
        execvp(cmd.items[0], cmd.items);
        perror("execvp");
        exit(1);
    } else if (pid > 0) {
        // Parent process
        int status;
        waitpid(pid, &status, 0);
        return WIFEXITED(status) && WEXITSTATUS(status) == 0;
    } else {
        perror("fork");
        return false;
    }
}

const char *nob_shift_args(int *argc, char ***argv) {
    if (*argc == 0) return NULL;
    const char *result = (*argv)[0];
    (*argc)--;
    (*argv)++;
    return result;
}

#endif // NOB_IMPLEMENTATION

#endif // NOB_H_